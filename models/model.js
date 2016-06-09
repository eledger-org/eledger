var Log            = require('../util/log');
var Q              = require('q');
var QueryBuilder   = require('./QueryBuilder');
var sql            = require('./sql');

/** MODEL.JS MEMBER FUNCTIONS **/

/** addCreateSql is used to build the list of create statements necessary to create the database from scratch **/
module.exports.addCreateSql = function(modelName, createStatement) {
  model = require('./model');

  if (model.createSql === undefined) {
    Log.I("Initializing createSql as an array.");
    model.createSql = Array();
  }

  model.createSql.push({
    "modelName":         modelName,
    "createStatement":   createStatement
  });
};

/** setMigrateSql is used to build the list of create and alter statements necessary to migrate the database from any point **/
module.exports.setMigrateSql = function(versionIntFrom, modelName, migrateStatement) {
  model = require('./model');

  if (model.migrateSql === undefined) {
    model.migrateSql = [];
  }

  if (model.migrateSql[versionIntFrom] !== undefined && model.migrateSql[versionIntFrom] !== null) {
    throw new Error("Each versionIntFrom must be different.  " + modelName +
        " tried to overwrite the existing migration query for " +
        JSON.stringify(model.migrateSql[versionIntFrom], null, 2));
  } else {
    model.migrateSql[versionIntFrom] = {
      "versionIntFrom":   versionIntFrom,
      "modelName":         modelName,
      "migrateStatement": migrateStatement
    };
  }
};

/** INITIALIZE MODELS **/
// All models should be added to module.exports with the same MODEL_NAME as the file name
// See Uploads for an example.

module.exports.DatabaseVersion    = require('./DatabaseVersion');
module.exports.Uploads            = require('./Uploads');
module.exports.UploadReadings     = require('./UploadReadings');
module.exports.Users              = require('./Users');

/** PREPARE DATABASE **/
sql.countTables().then(function(count) {
  if (count === 0) {
    /** BLANK DB, CREATE FROM SCRATCH **/
    Log.I("Creating database from scratch.");

    model = require('./model');

    return sql.beginTransaction().then(function() {
      return model.createDB();
    }).then(function() {
      return sql.setDatabaseVersion(model.migrateSql.length);
    }).then(function() {
      return sql.commit();
    });
  } else {
    /** UPGRADE EXISTING DATABASE **/

    // Do Upgrades
    return sql.beginTransaction().then(function() {
      return model.upgradeDB();
    }).then(function() {
      return model.setDatabaseVersion();
    }).then(function() {
      return sql.commit();
    });
  }
}).catch(function(err) {
  Log.E(err);

  sql.rollbackTransaction().then(function() {
    return sql.getDatabaseVersion(function(result) {
      require('./model').databaseVersion = result;
    });
  });
});

module.exports.insert = function(opts) {
  var qb = new QueryBuilder();

  return qb.insert(opts.table).fields(opts.fields).values(opts.values).queryPromise();
};

module.exports.update = function(opts) {
  var qb = new QueryBuilder();

  return qb.update(opts.table).set(opts.set).where(opts.where).queryPromise();
};

module.exports.find = function(opts) {
  var qb = new QueryBuilder();

  return qb.select(opts.fields).from(opts.table).where(opts.where).limit(opts.offset, opts.limit).queryPromise();
};

module.exports.count = function(opts) {
  var qb = new QueryBuilder();

  if (opts.countField === undefined) {
    return qb.count().from(opts.table).queryPromise();
  } else {
    return qb.count(opts.countField).from(opts.table).queryPromise();
  }
};

module.exports.setDatabaseVersion = function() {
  model = require('./model');

  return sql.setDatabaseVersion(model.databaseVersion);
};

module.exports.createDB = function() {
  model  = require('./model');
  sql    = require('./sql');

  chain = [];

  var statementIter = 0;

  for (statementIter = 0; statementIter < model.createSql.length; ++statementIter) {
    chain.push(function(statementIndex) {
      const statement = require('./model').createSql[statementIndex].createStatement;
      return sql.rawQueryPromise(statement).then(function() {
        return new Q.Promise(function(resolve, reject) {
          resolve(statementIndex + 1);
        });
      });
    });
  }

  return chain.reduce(Q.when, Q(0));
};

module.exports.upgradeDB = function() {
  model = require('./model');

  return sql.getDatabaseVersion().then(function(result) {
    model.databaseVersion = result;

    migrateSqlIter = model.migrateSql[model.databaseVersion];

    if (migrateSqlIter === undefined || migrateSqlIter === null) {
      return new Q.Promise(function(resolve, reject) {
        Log.I({"message": "No database upgrade was required", "reason": {"Local DB Version": model.databaseVersion, "Expected DB Version": model.migrateSql.length}});

        resolve({"finished": true});
      });
    }

    return require('./model').upgradeRecursively();
  });
};

module.exports.upgradeRecursively = function() {
  model = require('./model');
  sql   = require('./sql');
  migrateSqlIter = model.migrateSql[model.databaseVersion];

  if (migrateSqlIter === undefined || migrateSqlIter === null) {
    return new Q.Promise(function(resolve, reject) {
      resolve({"finished": true});
    });
  }

  statement = migrateSqlIter.migrateStatement;

  return sql.rawQueryPromise(statement)
    .then(function() {
      model.databaseVersion++;

      model.upgradeRecursively;
    });
};

