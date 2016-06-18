"use strict";

var model             = require("./model");
var sql               = require("./sql");
var squel             = require("squel");

const TABLE_NAME = "LedgerEntries";
const MODEL_NAME = "LedgerEntries";

module.exports.TABLE_NAME = TABLE_NAME;

/** SQL INITIALIZATION **/

const initialCreateSql = `
CREATE TABLE LedgerEntries (
  id              BIGINT UNSIGNED   AUTO_INCREMENT,
  generalLedgerDate BIGINT UNSIGNED   NOT NULL,
  description     VARCHAR(255)      NOT NULL,
  account         VARCHAR(255)      NOT NULL,
  reconciled      VARCHAR(255)      DEFAULT "NO",
  credit          BIGINT            DEFAULT 0,
  debit           BIGINT            DEFAULT 0,
  createdDate     BIGINT UNSIGNED   NOT NULL,
  createdBy       BIGINT UNSIGNED   NOT NULL,
  modifiedDate    BIGINT UNSIGNED   DEFAULT NULL,
  modifiedBy      BIGINT UNSIGNED   DEFAULT NULL,
  deletedDate     BIGINT UNSIGNED   DEFAULT NULL,
  deletedBy       BIGINT UNSIGNED   DEFAULT NULL,
  PRIMARY KEY (id)
)
`;


/** SQL INITIALIZATION **/

// eslint-disable-next-line no-unused-vars
const migrations = [
];

/** CURRENT CREATE TABLE STATEMENT **/

const currentCreateSql = initialCreateSql;

/** SETUP MIGRATION AND DATABASE INITIALIZATION **/

model.addCreateSql(MODEL_NAME, currentCreateSql);

model.setMigrateSql(10, MODEL_NAME, initialCreateSql);

module.exports.count = function() {
  return sql.rawQueryPromise(squel
    .select()
    .field("COUNT(*)", "count")
    .from(TABLE_NAME)
    .toString());
};

