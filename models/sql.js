"use strict";

var Log               = require("node-android-logging");
var mysqlc            = require("../mysqlc").mysqlc;
module.exports.mysqlc = mysqlc;
var Q                 = require("q");
var squel             = require("squel");

module.exports.rawQueryPromise = function(statement) {
  Log.T("\n----" + statement + "\n");

  return new Q.Promise(function(resolve, reject) {
    mysqlc.query(statement, function(err, rows, fields) {
      if (err) {
        reject({
          "err": err,
          "errstack": err.stack,
          "rows": rows,
          "fields": fields,
          "statement": statement
        });
      } else {
        let message = "Query success.";

        if (rows.length !== undefined) {
          message += "  Row count: " + rows.length;
        }

        Log.T(message);

        resolve(rows);
      }
    });
  });
};

module.exports.listTables = function() {
  return this.rawQueryPromise("SHOW TABLES");
};

module.exports.countTables = function() {
  return this.listTables().then(function (resolution) {
    return new Q.Promise(function(resolve, reject) {
      resolve(resolution.length);
    });
  });
};

module.exports.getDatabaseVersion = function() {
  let query = squel.select()
    .field("databaseVersion")
    .from("DatabaseVersion")
    .toString();

  return this.rawQueryPromise(query).then(function(rows) {
    return new Q.Promise(function(resolve, reject) {
      resolve(rows[0].databaseVersion);
    });
  });
};

module.exports.setDatabaseVersion = function(version) {
  if (version === undefined) {
    return new Q.Promise(function(resolve, reject) {
      reject("version not defined for setDatabaseVersion");
    });
  }

  let query = squel.update()
    .table("DatabaseVersion")
    .set("databaseVersion", version)
    .toString();

  return this.rawQueryPromise(query);
};

module.exports.beginTransaction = function() {
  return new Q.Promise(function(resolve, reject) {
    mysqlc.beginTransaction(function () {
      resolve({"success": true});
    });
  });
};

module.exports.rollbackTransaction = function() {
  return new Q.Promise(function(resolve, reject) {
    mysqlc.rollback(function() {
      // There doesn"t appear to be any error to catch for this.
      resolve({"success": true});
    });
  });
};

module.exports.commit = function() {
  return new Q.Promise(function(resolve, reject) {
    mysqlc.commit(function() {
      // There doesn"t appear to be any error to catch for this.
      resolve({"success": true});
    });
  });
};

