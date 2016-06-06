var $     = require('../util/jquery').$;
var model = require('./model');

const TABLE_NAME = "users";
const MODEL_NAME = "Users";

/** SQL INITIALIZATION **/

const initialCreateSql = `
CREATE TABLE users (
  id              BIGINT unsigned    NOT NULL AUTO_INCREMENT,
  name            VARCHAR(255)      NOT NULL,
  email            VARCHAR(255)      NOT NULL,
  createdDate     BIGINT UNSIGNED   NOT NULL,
  createdBy       BIGINT UNSIGNED   NOT NULL,
  modifiedDate    BIGINT UNSIGNED   DEFAULT NULL,
  modifiedBy      BIGINT UNSIGNED   DEFAULT NULL,
  deletedDate     BIGINT UNSIGNED   DEFAULT NULL,
  deletedBy       BIGINT UNSIGNED   DEFAULT NULL,
  PRIMARY KEY (id)
  );
`;

/** SQL MIGRATIONS **/

const migrations = [ ];

/** CURRENT CREATE TABLE STATEMENT **/

const currentCreateSql = initialCreateSql;

/** SETUP MIGRATION AND DATABASE INITIALIZATION **/

model.addCreateSql(MODEL_NAME, currentCreateSql);

model.setMigrateSql(3, MODEL_NAME, initialCreateSql);

/** MODEL FUNCTIONS **/

def_opts = {"table": TABLE_NAME};

module.exports.find = function(opts) {
  return model.find($.extend(true, {}, def_opts, opts));
};

module.exports.count = function(opts) {
  return model.count($.extend(true, {}, def_opts, opts));
};

