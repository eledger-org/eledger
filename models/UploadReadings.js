var $			= require('../util/jquery').$;
var model = require('./model');

const TABLE_NAME = "uploadReadings";
const MODEL_NAME = "UploadReadings";

/** SQL INITIALIZATION **/

const initialCreateSql = `
CREATE TABLE UploadReadings (
	id 						BIGINT UNSIGNED 	AUTO_INCREMENT,
	uploadsId			BIGINT UNSIGNED		NOT NULL,
	ocrParamsJson	VARCHAR(255)			NOT NULL,
	dataJson			VARCHAR(60000)		NOT NULL,
	createdDate		BIGINT UNSIGNED		NOT NULL,
	createdBy			BIGINT UNSIGNED		NOT NULL,
	modifiedDate	BIGINT UNSIGNED		DEFAULT NULL,
	modifiedBy		BIGINT UNSIGNED		DEFAULT NULL,
	deletedDate		BIGINT UNSIGNED		DEFAULT NULL,
	deletedBy			BIGINT UNSIGNED		DEFAULT NULL,
	PRIMARY KEY (id)
);
`;

/** SQL INITIALIZATION **/

const migrations = [];

/** CURRENT CREATE TABLE STATEMENT **/

const currentCreateSql = initialCreateSql;

/** SETUP MIGRATION AND DATABASE INITIALIZATION **/

model.addCreateSql('UploadReadings', initialCreateSql);

model.setMigrateSql(4, MODEL_NAME, initialCreateSql);

/** MODEL FUNCTIONS **/

def_opts = {"table": TABLE_NAME};

module.exports.find = function(opts) {
	return model.find($.extend(true, {}, def_opts, opts));
};

module.exports.count = function(opts) {
	return model.count($.extend(true, {}, def_opts, opts));
};

