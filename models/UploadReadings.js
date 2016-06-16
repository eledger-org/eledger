var $                 = require('../util/jquery').$;
var model             = require('./model');
var sql               = require('./sql');
var mysqlc            = require('../mysqlc');
var squel             = require('squel');
var Log               = require('node-android-logging');

const TABLE_NAME = "UploadReadings";
const MODEL_NAME = "UploadReadings";

module.exports.TABLE_NAME = TABLE_NAME;

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

module.exports.save = function(readings) {
  return sql.rawQueryPromise(squel
    .select()
    .field("id")
    .from(TABLE_NAME)
    .where("JSON_EXTRACT(ocrParamsJson, \"$.proof\") = true")
    .where("uploadsId = ?", readings.id).toString()).then(

  function(result) {
    if (result.length === 0) {
      return sql.rawQueryPromise(squel
        .insert()
        .into(TABLE_NAME)
        .setFields({
          uploadsId:      readings.id,
          ocrParamsJson:  JSON.stringify({proof: true}),
          dataJson:       JSON.stringify(readings.dataJson),
          createdBy:      0,
          createdDate:    (new Date).getTime()
        })
        .toString());
    } else {
      return sql.rawQueryPromise(squel
        .update()
        .table(TABLE_NAME)
        .setFields({
          uploadsId:      readings.id,
          dataJson:       JSON.stringify(readings.dataJson),
          modifiedDate:   (new Date).getTime()
        })
        .where("id = ?", result[0].id)
        .toString());
    }
  });
};

module.exports.find = function(opts) {
  Log.I(opts);

  opts = $.extend(true, {}, {limit: 10, offset: 0}, opts);

  Log.I(opts);

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

