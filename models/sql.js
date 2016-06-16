mysqlc                = require('../mysqlc').mysqlc;
module.exports.mysqlc = mysqlc;
var Q                 = require('q');
var squel             = require('squel');

module.exports.rawQueryPromise = function(statement) {
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
  return this.rawQueryPromise(
    squel.select().field('databaseVersion').from('DatabaseVersion').toString())
    .then(function(rows) {
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

  return this.rawQueryPromise(squel.update().table('DatabaseVersion').set('databaseVersion', version).toString());
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

