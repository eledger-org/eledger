"use strict";

var $                 = require("../util/jquery").$;
var model             = require("./model");
var sql               = require("./sql");
var squel             = require("squel");

const TABLE_NAME = "Uploads";
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
  `,
  `
RENAME  TABLE   uploads
TO              Uploads
  `,
  `
ALTER   TABLE   Uploads
ADD COLUMN
  serviceName     VARCHAR(255)      NOT NULL    AFTER id,
ADD COLUMN
  createdDate     BIGINT UNSIGNED   NOT NULL,
ADD COLUMN
  createdBy       BIGINT UNSIGNED   NOT NULL,
ADD COLUMN
  modifiedDate    BIGINT UNSIGNED   DEFAULT NULL,
ADD COLUMN
  modifiedBy      BIGINT UNSIGNED   DEFAULT NULL,
ADD COLUMN
  deletedDate     BIGINT UNSIGNED   DEFAULT NULL,
ADD COLUMN
  deletedBy       BIGINT UNSIGNED   DEFAULT NULL
  `,
  `
UPDATE Uploads
SET Uploads.createdDate = UNIX_TIMESTAMP(dt)
  `,
  `
ALTER   TABLE   Uploads
DROP    COLUMN  dt
  `];

/** CURRENT CREATE TABLE STATEMENT **/

const currentCreateSql = `
CREATE TABLE Uploads (
  id              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  serviceName     VARCHAR(255)      NOT NULL,
  filename        VARCHAR(255)      NOT NULL,
  uniqid          VARCHAR(255)      NOT NULL,
  createdDate     BIGINT UNSIGNED   NOT NULL,
  createdBy       BIGINT UNSIGNED   NOT NULL,
  modifiedDate    BIGINT UNSIGNED   DEFAULT NULL,
  modifiedBy      BIGINT UNSIGNED   DEFAULT NULL,
  deletedDate     BIGINT UNSIGNED   DEFAULT NULL,
  deletedBy       BIGINT UNSIGNED   DEFAULT NULL,
  PRIMARY KEY (id)
  );
`;

/** SETUP MIGRATION AND DATABASE INITIALIZATION **/

model.addCreateSql(MODEL_NAME, currentCreateSql);

model.setMigrateSql(1, MODEL_NAME, initialCreateSql);

model.setMigrateSql(2, MODEL_NAME, migrations[0]);
model.setMigrateSql(6, MODEL_NAME, migrations[1]);
model.setMigrateSql(7, MODEL_NAME, migrations[2]);
model.setMigrateSql(8, MODEL_NAME, migrations[3]);
model.setMigrateSql(9, MODEL_NAME, migrations[4]);

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

