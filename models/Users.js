var $     = require('../util/jquery').$;
var model = require('./model');

const TABLE_NAME = "users";
const MODEL_NAME = "Users";

/** SQL INITIALIZATION **/

const initialCreateSql = `
CREATE TABLE users (
  id              BIGINT unsigned   AUTO_INCREMENT,
  name            VARCHAR(255)      NOT NULL,
  email           VARCHAR(255)      NOT NULL,
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

module.exports.find = function(opts) {
  require('./Users').def_opts = {"table": TABLE_NAME};

  return model.find($.extend(true, {}, require('./Users').def_opts, opts));
};

module.exports.count = function(opts) {
  require('./Users').def_opts = {"table": TABLE_NAME};

  return model.count($.extend(true, {}, require('./Users').def_opts, opts));
};

