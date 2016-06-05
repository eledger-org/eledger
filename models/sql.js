mysqlc 								= require('../mysqlc').mysqlc;
module.exports.mysqlc = mysqlc;
var Q      						= require('q');

module.exports.query = function(queryCallback) {
	if (!this._fields || (this._fields === undefined)) {
		this._fields = "*";
	} else if (Array.isArray(this._fields)) {
		this._fields = this._fields.join(',');
	}

	// TODO Fix this so I'm not just concatenating fields and table name, or at least doing some work to block sql injection at this level.
	this.statement = "SELECT ?? FROM ?? LIMIT ?, ?";

	mysqlc.query(this.statement, [ this._fields, this._table, this._offset, this._limit ], queryCallback);

	return this;
};

module.exports.rawQueryPromise = function(statement) {
	return new Q.Promise(function(resolve, reject) {
		mysqlc.query(statement, function (err, rows, fields) {
			if (err) {
				reject({"err": err, "errstack": err.stack, "rows": rows, "fields": fields, "statement": statement});
			} else {
				resolve(rows);
			}
		});
	});
};

module.exports.count = function(queryCallback) {
	this.statement = "SELECT COUNT(*) as count FROM ??";

	mysqlc.query(this.statement, [ this._table ], queryCallback);

	return this;
};

module.exports.listTables = function() {
	return new Q.Promise(function(resolve, reject) {
		this.statement = "SHOW TABLES";

		mysqlc.query(this.statement, function (err, rows, fields) {
			if (err) {
				reject({"err": err, "rows": rows, "fields": fields});
			} else {
				resolve(rows);
			}
		});
	});
};

module.exports.countTables = function() {
	return require('./sql.js').listTables().then(function (resolution) {
		return new Q.Promise(function(resolve, reject) {
			resolve(resolution.length);
		});
	});
};

module.exports.listDatabases = function(queryCallback) {
	this.statement = "SHOW DATABASES";

	mysqlc.query(this.statement, queryCallback);

	return this;
};

module.exports.listTablesLike = function(likeString, queryCallback) {
	this.statement = "SHOW TABLES LIKE ?";

	mysqlc.query(this.statement, [ likeString ], queryCallback);

	return this;
};

module.exports.getDatabaseVersion = function() {
	return new Q.Promise(function(resolve, reject) {
		this.statement = "SELECT databaseVersion FROM DatabaseVersion";

		mysqlc.query(this.statement, function (err, rows, fields) {
			if (err) {
				reject({"err": err, "rows": rows, "fields": fields});
			} else {
				if (rows.length === 1) {
					resolve(rows[0].databaseVersion);
				} else {
					reject({"err": "row count is not 1", "rows": rows, "fields": fields});
				}
			}
		});
	});
};

module.exports.setDatabaseVersion = function(version) {
	if (version === undefined) {
		return new Q.Promise(function(resolve, reject) {
			reject("version not defined for setDatabaseVersion");
		});
	}

	return require('./sql').rawQueryPromise("UPDATE DatabaseVersion SET databaseVersion = " + version);
};

module.exports.beginTransaction = function() {
	return new Q.Promise(function(resolve, reject) {
		mysqlc.beginTransaction(function () {
			resolve({"success": true});
		});
	});
};

module.exports.rollbackTransaction = function() {
	return new Q.Promise(function(resolve, reject) {
		mysqlc.rollback(function() {
			// There doesn't appear to be any error to catch for this.
			resolve({"success": true});
		});
	});
};

module.exports.commit = function() {
	return new Q.Promise(function(resolve, reject) {
		mysqlc.commit(function() {
			// There doesn't appear to be any error to catch for this.
			resolve({"success": true});
		});
	});
};

