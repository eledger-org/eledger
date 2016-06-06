var $     = require('../util/jquery').$;
var model = require('./model');
var sql   = require('./sql');

const TABLE_NAME = "uploadReadings";
const MODEL_NAME = "UploadReadings";

/** SQL INITIALIZATION **/

const initialCreateSql = `
CREATE TABLE UploadReadings (
  id              BIGINT UNSIGNED   AUTO_INCREMENT,
  uploadsId       BIGINT UNSIGNED   NOT NULL,
  ocrParamsJson   VARCHAR(255)      NOT NULL,
  dataJson        VARCHAR(60000)    NOT NULL,
  createdDate     BIGINT UNSIGNED   NOT NULL,
  createdBy       BIGINT UNSIGNED   NOT NULL,
  modifiedDate    BIGINT UNSIGNED   DEFAULT NULL,
  modifiedBy      BIGINT UNSIGNED   DEFAULT NULL,
  deletedDate     BIGINT UNSIGNED   DEFAULT NULL,
  deletedBy       BIGINT UNSIGNED   DEFAULT NULL,
  PRIMARY KEY (id)
);
`;

/** SQL INITIALIZATION **/

const migrations = [
`
ALTER TABLE UploadReadings
MODIFY COLUMN ocrParamsJson   JSON              NOT NULL,
MODIFY COLUMN dataJson        JSON              NOT NULL;
`
];

/** CURRENT CREATE TABLE STATEMENT **/

const currentCreateSql = `
CREATE TABLE UploadReadings (
  id              BIGINT UNSIGNED   AUTO_INCREMENT,
  uploadsId       BIGINT UNSIGNED   NOT NULL,
  ocrParamsJson   JSON              NOT NULL,
  dataJson        JSON              NOT NULL,
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

model.setMigrateSql(4, MODEL_NAME, initialCreateSql);
model.setMigrateSql(5, MODEL_NAME, migrations[0]);

/** MODEL FUNCTIONS **/

module.exports.find = function(opts) {
  require('./UploadReadings').def_opts = {"table": TABLE_NAME};

  return model.find($.extend(true, {}, require('./UploadReadings').def_opts, opts));
};

module.exports.count = function(opts) {
  require('./UploadReadings').def_opts = {"table": TABLE_NAME};

  return model.count($.extend(true, {}, require('./UploadReadings').def_opts, opts));
};

module.exports.save = function(readings) {
  require('./UploadReadings').def_opts = {"table": TABLE_NAME};

  return sql.rawQueryPromise("SELECT id FROM UploadReadings WHERE ocrParamsJson->\"$.proof\" = true;").then(function(result) {
    console.log(result);

    if (result.length === 0) {
      return sql.rawQueryPromise("INSERT INTO UploadReadings (uploadsId, ocrParamsJson, dataJson, createdDate, createdBy) VALUES (" + readings.id + ", '{\"proof\": true}', '" + JSON.stringify(readings.dataJson) + "', 0, NOW())");
    } else {
      return sql.rawQueryPromise("UPDATE UploadReadings SET dataJson = '" + JSON.stringify(readings.dataJson) + "' WHERE id = " + result[0].id);
    }
  });
};

