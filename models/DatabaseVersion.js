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

def_opts = {"table": MODEL_NAME};

module.exports.find = function(opts) {
  return model.find($.extend(true, {}, def_opts, opts));
};

