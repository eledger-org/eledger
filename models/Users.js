var $                 = require('../util/jquery').$;
var model             = require('./model');

const TABLE_NAME = "users";
const MODEL_NAME = "Users";

module.exports.TABLE_NAME = TABLE_NAME;

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
  opts = $.extend(true, {}, {limit: 10, offset: 0}, opts);

  return sql.rawQueryPromise(squel
    .select()
    .from(TABLE_NAME)
    .limit(opts.limit)
    .offset(opts.offset)
    .toString());
};

module.exports.count = function() {
  return sql.rawQueryPromise(squel
    .select()
    .field("COUNT(*)", "count")
    .from(TABLE_NAME)
    .toString());
};

