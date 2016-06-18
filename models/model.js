"use strict";

var Log               = require("node-android-logging");
var Q                 = require("q");
var sql               = require("./sql");
var squel             = require("squel");

var model;

/** MODEL.JS MEMBER FUNCTIONS **/

/** addCreateSql is used to build the list of create statements necessary to create the database from scratch **/
module.exports.addCreateSql = function(modelName, createStatement) {
  model = require("./model");

  if (model.createSql === undefined) {
    Log.I("Initializing createSql as an array.");
    model.createSql = Array();
  }

  model.createSql.push({
    modelName:         modelName,
    createStatement:   createStatement
  });
};

/** setMigrateSql is used to build the list of create and alter statements necessary to migrate the database from any point **/
module.exports.setMigrateSql = function(versionIntFrom, modelName, migrateStatement) {
  model = require("./model");

  if (model.migrateSql === undefined) {
    model.migrateSql = [];
  }

  if (model.migrateSql[versionIntFrom] !== undefined &&
      model.migrateSql[versionIntFrom] !== null) {
    throw new Error("Each versionIntFrom must be different.  " + modelName +
        " tried to overwrite the existing migration query for " +
        JSON.stringify(model.migrateSql[versionIntFrom], null, 2));
  } else {
    model.migrateSql[versionIntFrom] = {
      versionIntFrom:   versionIntFrom,
      modelName:        modelName,
      migrateStatement: migrateStatement
    };
  }
};

/** INITIALIZE MODELS **/
// All models should be added to module.exports with the same MODEL_NAME as the file name
// See Uploads for an example.

module.exports.DatabaseVersion    = require("./DatabaseVersion");
module.exports.Uploads            = require("./Uploads");
module.exports.UploadReadings     = require("./UploadReadings");
module.exports.Users              = require("./Users");
module.exports.LedgerEntries      = require("./LedgerEntries");

/** PREPARE DATABASE **/
sql.countTables().then(function(count) {
  model = require("./model");

  if (count === 0) {
    /** BLANK DB, CREATE FROM SCRATCH **/
    Log.I("Creating database from scratch.");

    return sql.beginTransaction().then(function() {
      return model.createDB();
    }).then(function() {
      return sql.setDatabaseVersion(model.migrateSql.length);
    }).then(function() {
      return sql.commit();
    }).catch(function(err) {
      throw err;
    });
  } else {
    /** UPGRADE EXISTING DATABASE **/

    let query = squel.select()
      .field("databaseVersion")
      .from("DatabaseVersion")
      .limit(1)
      .toString();

    // Do Upgrades
    return sql.rawQueryPromise(query).then(function(result) {
      model.databaseVersion = result[0].databaseVersion;

      if (model.databaseVersion === model.migrateSql.length) {
        return new Q.Promise(function(resolve, reject) {
          reject({
            "err": false,
            "message": "Database is already up to date at version " + model.databaseVersion + "!"
          });
        });
      }

      return sql.beginTransaction();
    }).then(function() {
      Log.D("Upgrading the database from version " + model.databaseVersion + " to " + model.migrateSql.length + ".");

      return model.upgradeDB();
    }).then(function() {
      return model.setDatabaseVersion();
    }).then(function() {
      return sql.commit();
    }).then(function() {
      return new Q.Promise(function(resolve, reject) {
        Log.D("Upgraded the database.");

        resolve();
      });
    }).catch(function(err) {
      if (err.err === false) {
        if (err.message !== undefined) {
          Log.I(err.message);
        }
      } else {
        throw err;
      }
    });
  }
}).catch(function(err) {
  Log.E({err: err});

  sql.rollbackTransaction().then(function() {
    return sql.getDatabaseVersion(function(result) {
      model.databaseVersion = result;
    });
  });
});

module.exports.setDatabaseVersion = function() {
  model = require("./model");

  Log.D("Setting database version to " + model.databaseVersion);

  return sql.setDatabaseVersion(model.databaseVersion);
};

module.exports.createDB = function() {
  model = require("./model");
  let chain = [];

  let statementIter = 0;

  let chainPush = function(statement) {
    return sql.rawQueryPromise(statement).then(function() {
      return new Q.Promise(function(resolve, reject) {
        resolve();
      });
    });
  };

  for (statementIter = 0; statementIter < model.createSql.length; ++statementIter) {
    if (Array.isArray(model.createSql[statementIter])) {
      for (let multiIter = 0; multiIter < model.createSql[statementIter].createStatement.length; ++multiIter) {
        chain.push(chainPush(model.createSql[statementIter].createStatement[multiIter]));
      }
    } else {
      chain.push(chainPush(model.createSql[statementIter].createStatement));
    }
  }

  return chain.reduce(Q.when, Q(0));
};

module.exports.upgradeDB = function() {
  model = require("./model");

  let query = squel.select()
    .field("databaseVersion")
    .from(module.exports.DatabaseVersion.TABLE_NAME)
    .limit(1)
    .toString();

  return sql.rawQueryPromise(query).then(function(result) {
    let chain = [];

    let statementIter = result[0].databaseVersion;

    let chainPush = function(statement) {
      return function() {
        return sql.rawQueryPromise(statement).then(function() {
          return new Q.Promise(function(resolve, reject) {
            model = require("./model");

            model.databaseVersion++;

            resolve();
          });
        });
      };
    };

    for (statementIter = result[0].databaseVersion; statementIter < model.migrateSql.length; ++statementIter) {
      Log.T(model.migrateSql[statementIter]);

      if (Array.isArray(model.migrateSql[statementIter].migrateStatement)) {
        for (let multiIter = 0; multiIter < model.migrateSql[statementIter].migrateStatement.length; ++multiIter) {
          Log.T(model.migrateSql[statementIter].migrateStatement[multiIter]);
          chain.push(chainPush(model.migrateSql[statementIter].migrateStatement[multiIter]));
        }
      } else {
        Log.T("Detected a string!");
        chain.push(chainPush(model.migrateSql[statementIter].migrateStatement));
      }
    }

    return chain.reduce(Q.when, Q(result[0].databaseVersion));
  });
};

