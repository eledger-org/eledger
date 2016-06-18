var $                 = require("../util/jquery").$;
var model             = require("./model");
var sql               = require("./sql");
var squel             = require("squel");

const TABLE_NAME = "uploads";
const MODEL_NAME = "Uploads";

module.exports.TABLE_NAME = TABLE_NAME;

/** SQL INITIALIZATION **/

const initialCreateSql = `
CREATE TABLE uploads (
  id        BIGINT        NOT NULL AUTO_INCREMENT,
  filename  VARCHAR(255)  NOT NULL,
  uniqid    VARCHAR(255)  NOT NULL,
  dt        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
  );
`;

/** SQL MIGRATIONS **/

const migrations = [
  `
ALTER   TABLE   uploads
CHANGE  COLUMN  id
  id        BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT;
  `
];

/** CURRENT CREATE TABLE STATEMENT **/

const currentCreateSql = `
CREATE TABLE uploads (
  id        BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  filename  VARCHAR(255)      NOT NULL,
  uniqid    VARCHAR(255)      NOT NULL,
  dt        TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
  );
`;

/** SETUP MIGRATION AND DATABASE INITIALIZATION **/

model.addCreateSql(MODEL_NAME, currentCreateSql);

model.setMigrateSql(1, MODEL_NAME, initialCreateSql);

model.setMigrateSql(2, MODEL_NAME, migrations[0]);

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

