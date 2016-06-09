var $             = require('../util/jquery').$;
var model         = require('./model');
var sql           = require('./sql');
var mysqlc        = require('../mysqlc');
var QueryBuilder  = require('./QueryBuilder');

const TABLE_NAME = "UploadReadings";
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
  return (new QueryBuilder()).select("id").from(TABLE_NAME).where([{
    columnType: 'json',
    columnName: 'ocrParamsJson',
    jsonKey: '$.proof',
    value: true,
    operand: '='
  }, {
    columnName: 'uploadsId',
    value: readings.id,
    operand: '='
  }]).queryPromise().then(function(result) {
    rows = result.rows;

    if (rows.length === 0) {
      return (new QueryBuilder()).insert(TABLE_NAME)
        .fields(["uploadsId", "ocrParamsJson", "dataJson", "createdBy", "createdDate"])
        .values([readings.id, JSON.stringify({proof: true}), JSON.stringify(readings.dataJson), 0, (new Date).getTime()])
        .queryPromise();
    } else {
      return (new QueryBuilder()).update(TABLE_NAME)
        .set([{
            key:   "uploadsId",
            value: readings.id
          }, {
            key:   "dataJson",
            value: JSON.stringify(readings.dataJson)
          }, {
            key:   "modifiedDate",
            value: (new Date).getTime()
          }])
        .where([{
          columName: 'id',
          value: result.rows[0].id,
          operand: '='
        }]).queryPromise();
    }
  });
};

