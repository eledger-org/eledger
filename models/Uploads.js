var $			= require('../util/jquery').$;
var model = require('./model');

const TABLE_NAME = "uploads";
const MODEL_NAME = "Uploads";

/** SQL INITIALIZATION **/

const initialCreateSql = `
CREATE TABLE uploads (
	id 				BIGINT 				NOT NULL AUTO_INCREMENT,
	filename 	VARCHAR(255) 	NOT NULL,
	uniqid		VARCHAR(255)	NOT NULL,
	dt				TIMESTAMP			NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
	);
`;

/** SQL MIGRATIONS **/

const migrations = [ `
ALTER TABLE uploads
CHANGE COLUMN id
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;
` ];

/** CURRENT CREATE TABLE STATEMENT **/

const currentCreateSql = `
CREATE TABLE uploads (
	id				BIGINT UNSIGNED		NOT NULL AUTO_INCREMENT,
	filename	VARCHAR(255)			NOT NULL,
	uniqid		VARCHAR(255)			NOT NULL,
	dt				TIMESTAMP					NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
	);
`;

/** SETUP MIGRATION AND DATABASE INITIALIZATION **/

model.addCreateSql(MODEL_NAME, currentCreateSql);

model.setMigrateSql(1, MODEL_NAME, initialCreateSql);

model.setMigrateSql(2, MODEL_NAME, migrations[0]);

/** MODEL FUNCTIONS **/

def_opts = {"table": TABLE_NAME};

module.exports.find = function(opts) {
	return model.find($.extend(true, {}, def_opts, opts));
};

module.exports.count = function(opts) {
	return model.count($.extend(true, {}, def_opts, opts));
};

