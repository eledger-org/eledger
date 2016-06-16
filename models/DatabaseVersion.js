var $                 = require('../util/jquery').$;
var model             = require('./model');
var squel             = require('squel');

const TABLE_NAME = "DatabaseVersion";
const MODEL_NAME = "DatabaseVersion";

module.exports.TABLE_NAME = TABLE_NAME;

/** SQL INITIALIZATION **/

const initialCreateSql = `
CREATE TABLE DatabaseVersion (
  databaseVersion BIGINT UNSIGNED NOT NULL
  );
`;

const initialDataSql = `
INSERT INTO DatabaseVersion (databaseVersion) VALUES (0);
`;

/** SQL INITIALIZATION **/

const migrations = [];

/** CURRENT CREATE TABLE STATEMENT **/

const currentCreateSql = initialCreateSql;

/** SETUP MIGRATION AND DATABASE INITIALIZATION **/

model.addCreateSql(MODEL_NAME, currentCreateSql);
model.addCreateSql(MODEL_NAME, initialDataSql);

model.setMigrateSql(0, MODEL_NAME, initialCreateSql);

/** MODEL FUNCTIONS **/

module.exports.find = function(opts) {
  opts = $.extend(true, {}, {limit: 10, offset: 0}, opts);

  return sql.rawQueryPromise(squel
    .select()
    .from(TABLE_NAME)
    .limit(opts.limit)
    .offset(opts.offset)
    .toString());
};

