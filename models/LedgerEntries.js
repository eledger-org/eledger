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

const initialBigintCurrencyString = `
CREATE FUNCTION bigintCurrencyString(bigintInput BIGINT, decimalPlaces INT)
  RETURNS CHAR(20) DETERMINISTIC
  BEGIN
    DECLARE inputChar CHAR(20);
    DECLARE length    INT;
    DECLARE currency  CHAR(20);

    SET inputChar = CAST(ROUND(bigintInput, -5 + decimalPlaces) AS char);
    SET length    = LENGTH(inputChar);

    IF (length > 5) THEN
      SET currency = CONCAT(LEFT(inputChar, length - 5), ".", MID(inputChar, length - 5, decimalPlaces));
    ELSE
      SET currency = CONCAT("0.", LEFT(LPAD(inputChar, 5, "0"), decimalPlaces));
    END IF;

    return currency;
  END
  `;
/** SQL INITIALIZATION **/

// eslint-disable-next-line no-unused-vars
const migrations = [
];

/** CURRENT CREATE TABLE STATEMENT **/

const currentCreateSql = initialCreateSql;
const currentBigintCurrencyString = initialBigintCurrencyString;

/** SETUP MIGRATION AND DATABASE INITIALIZATION **/

model.addCreateSql(MODEL_NAME, currentCreateSql);
model.addCreateSql(MODEL_NAME, currentBigintCurrencyString);

model.setMigrateSql(10, MODEL_NAME, initialCreateSql);
model.setMigrateSql(11, MODEL_NAME, initialBigintCurrencyString);

module.exports.count = function() {
  return sql.rawQueryPromise(squel
    .select()
    .field("COUNT(*)", "count")
    .from(TABLE_NAME)
    .toString());
};

