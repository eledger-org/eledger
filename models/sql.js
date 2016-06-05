mysqlc                = require('../mysqlc').mysqlc;
module.exports.mysqlc = mysqlc;
var Q                 = require('q');

module.exports.rawQueryPromise = function(statement) {
  return new Q.Promise(function(resolve, reject) {
    mysqlc.query(statement, function (err, rows, fields) {
      if (err) {
        reject({"err": err, "errstack": err.stack, "rows": rows, "fields": fields, "statement": statement});
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports.listTables = function() {
  return new Q.Promise(function(resolve, reject) {
    this.statement = "SHOW TABLES";

    mysqlc.query(this.statement, function (err, rows, fields) {
      if (err) {
        reject({"err": err, "rows": rows, "fields": fields});
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports.countTables = function() {
  return require('./sql.js').listTables().then(function (resolution) {
    return new Q.Promise(function(resolve, reject) {
      resolve(resolution.length);
    });
  });
};

module.exports.getDatabaseVersion = function() {
  return new Q.Promise(function(resolve, reject) {
    this.statement = "SELECT databaseVersion FROM DatabaseVersion";

    mysqlc.query(this.statement, function (err, rows, fields) {
      if (err) {
        reject({"err": err, "rows": rows, "fields": fields});
      } else {
        if (rows.length === 1) {
          resolve(rows[0].databaseVersion);
        } else {
          reject({"err": "row count is not 1", "rows": rows, "fields": fields});
        }
      }
    });
  });
};

module.exports.setDatabaseVersion = function(version) {
  if (version === undefined) {
    return new Q.Promise(function(resolve, reject) {
      reject("version not defined for setDatabaseVersion");
    });
  }

  return require('./sql').rawQueryPromise("UPDATE DatabaseVersion SET databaseVersion = " + version);
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
      // There doesn't appear to be any error to catch for this.
      resolve({"success": true});
    });
  });
};

module.exports.commit = function() {
  return new Q.Promise(function(resolve, reject) {
    mysqlc.commit(function() {
      // There doesn't appear to be any error to catch for this.
      resolve({"success": true});
    });
  });
};

