var model = require('./model');
var sql   = require('./sql');

const TABLE_NAME = "DatabaseVersion";
const MODEL_NAME = "DatabaseVersion";

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
  require('./DatabaseVersion').def_opts = {"table": MODEL_NAME};

  return model.find($.extend(true, {}, require('./DatabaseVersion').def_opts, opts));
};

