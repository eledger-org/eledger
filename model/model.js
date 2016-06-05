var Log						= require('../util/log');
var Q      				= require('q');
var QueryBuilder 	= require('./QueryBuilder');
var sql 					= require('./sql');

/** MODEL.JS MEMBER FUNCTIONS **/

/** setCreateSql is used to build the list of create statements necessary to create the database from scratch **/
module.exports.setCreateSql = function(modelName, createStatement) {
	if (this.createSql === undefined) {
		this.createSql = {};
	}

	if (this.createSql[modelName] === undefined) {
		this.createSql[modelName] = [];
	}

	this.createSql[modelName] = {
		"modelName": 				modelName,
		"createStatement": 	createStatement
	};
};

/** setMigrateSql is used to build the list of create and alter statements necessary to migrate the database from any point **/
module.exports.setMigrateSql = function(versionIntFrom, modelName, migrateStatement) {
	if (this.migrateSql === undefined) {
		this.migrateSql = [];
	}

	if (this.migrateSql[versionIntFrom] !== undefined && this.migrateSql[versionIntFrom] !== null) {
		throw new Error("Each versionIntFrom must be different.  " + modelName +
				" tried to overwrite the existing migration query for " +
				JSON.stringify(this.migrateSql[versionIntFrom], null, 2));
	} else {
		this.migrateSql[versionIntFrom] = {
			"versionIntFrom": 	versionIntFrom,
			"modelName": 				modelName,
			"migrateStatement": migrateStatement
		};
	}
};

/** INITIALIZE MODELS **/
// All models should be added to module.exports with the same MODEL_NAME as the file name
// See Uploads for an example.

module.exports.DatabaseVersion		= require('./DatabaseVersion');
module.exports.Uploads						= require('./Uploads');
//module.exports.UploadReadings			= require('./UploadReadings');
//module.exports.Users							= require('./Users');

/** PREPARE DATABASE **/
const model = require('./model');

var numTables = sql.countTables();

console.log({"numTables": numTables});

if (numTables === 0) {
	/** BLANK REPO, CREATE FROM SCRATCH **/
	err = new Error("Create from scratch not implemented.");

	Log.E(err);

	throw err;
} else {
	/** UPGRADE EXISTING DATABASE **/

	// Do Upgrades
	sql.beginTransaction().then(function() {
		return model.upgradeDB();
	}).then(function() {
		return model.setDatabaseVersion();
	}).then(function() {
		return sql.commit();
	}).catch(function(err) {
		//console.log(err.stack);
		Log.E(err);

		sql.rollbackTransaction().then(function() {
			return sql.getDatabaseVersion(function(result) {
				require('./model').databaseVersion = result;
			});
		});
	});
}

module.exports.find = function(opts) {
	var qb = new QueryBuilder();

	return qb.select(opts.fields).from(opts.table).limit(opts.offset, opts.limit).queryPromise();
};

module.exports.count = function(opts) {
	var qb = new QueryBuilder();

	if (opts.countField === undefined) {
		return qb.count().from(opts.table).queryPromise();
	} else {
		return qb.count(opts.countField).from(opts.table).queryPromise();
	}
};

module.exports.setDatabaseVersion = function() {
	model = require('./model');

	return sql.setDatabaseVersion(model.databaseVersion);
};

module.exports.upgradeDB = function() {
	model = require('./model');

	return sql.getDatabaseVersion().then(function(result) {
		model.databaseVersion = result;

		migrateSqlIter = model.migrateSql[model.databaseVersion];

		if (migrateSqlIter === undefined || migrateSqlIter === null) {
			return new Q.Promise(function(resolve, reject) {
				Log.I({"message": "No database upgrade was required", "reason": {"Local DB Version": model.databaseVersion, "Expected DB Version": model.migrateSql.length}});

				resolve({"finished": true});
			});
		}

		return require('./model').upgradeRecursively();
	});
};

module.exports.upgradeRecursively = function() {
	model = require('./model');
	sql   = require('./sql');
	migrateSqlIter = model.migrateSql[model.databaseVersion];

	if (migrateSqlIter === undefined || migrateSqlIter === null) {
		return new Q.Promise(function(resolve, reject) {
			resolve({"finished": true});
		});
	}

	statement = migrateSqlIter.migrateStatement;

	return sql.rawQueryPromise(statement)
		.then(function() {
			model.databaseVersion++;

			model.upgradeRecursively;
		});
};

