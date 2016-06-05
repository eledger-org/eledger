var Log			= require('../util/log');
var method 	= QueryBuilder.prototype;
var Q				= require('q');

function QueryBuilder() {
	this._fields			= [];
	this._table				= "";
	this._joins				= [];
	this._where				= [];
	this._limit				= 10;
	this._offset			= 0;
	this._countFields	= [];
}

method.getLimit		= function() { return this._limit; };
method.getOffset	= function() { return this._offset; };

method.queryPromise = function() {
	var qb = this;

	return new Q.Promise(function(resolve, reject) {
		var q = "";
		var queryParams = [];

		if (qb._fields.length === 0 && qb._countFields.length === 0) {
			qb._fields.push("*");

			q = q + "SELECT ??";
		} else {
			if (qb._fields.length > 0 && qb._countFields.length > 0) {
				q = q + "SELECT ??, COUNT(??) as count";

				queryParams.push(qb._fields);
				queryParams.push(qb._countFields);
			} else {
				if(qb._fields.length !== 0) {
					q = q + "SELECT ??";

					queryParams.push(qb._fields);
				} else if (qb._countFields.length !== 0) {
					q = q + "SELECT COUNT(??) as count";

					// Normally we would support count this way:
					//queryParams.push(qb._countFields);

					// COUNT(*) doesn't work without this hackish strategy because it wraps the * in quotes:
					if (qb._countFields.length === 1 && qb._countFields[0] === "*") {
						q = q.replace(/[\?]{2}/, "*");
					} else {
						queryParams.push(qb._countFields);
					}
				} else {
					err = new Error("Not sure how to create this query.");
					err.extraInfo.queryInfo = {"query": q, "params": queryParams};

					reject(err);
				}
			}
		}


		if (qb._table.length === 0) {
			reject("You must select a table using QueryBuilder.from()");
		}

		queryParams.push(qb._table);
		q = q + " FROM ??";

		if (qb._joins.length !== 0) {
			reject("Joins are not yet implemented.");
		}

		if (qb._where.length !== 0) {
			reject("Where statements are not yet implemented.");
		}

		if (qb._limit !== undefined) {
			if (qb._limit <= 0) {
				reject("Invalid limit value.");
			}

			queryParams.push(qb._limit);
			q = q + " LIMIT ?";

			if (qb._offset !== undefined) {
				if (qb._offset < 0) {
					reject("Invalid offset value.");
				}

				queryParams.push(qb._offset);
				q = q + " OFFSET ?";
			}
		}

		resolve({"query": q, "params": queryParams, "qb": qb});
	}).then(function (resolution) {
		var queryInfo = resolution;
		var qb				= resolution.qb;

		return new Q.Promise(function(resolve, reject) {
			try {
				mysqlc.query(queryInfo.query, queryInfo.params, function (err, rows, fields) {
					if (err) {
						err.extraInfo = {};
						err.extraInfo.queryInfo = queryInfo;
						reject(err);
					} else {
						Log.d(queryInfo);

						resolve({"rows": rows, "queryInfo": queryInfo, "queryBuilder": qb});
					}
				});
			} catch (ex) {
				Log.e(queryInfo);
				Log.e(ex);
			}
		});
	});
}

method.select = function(fields) {
	if (fields === undefined) {
		this._fields.push("*");
	} else if (typeof fields === "string") {
		if (fields.length === 0) {
			this._fields.push("*");
		} else {
			this._fields.push(fields);
		}
	} else if (Array.isArray(fields)) {
		if (fields.length === 0) {
			this._fields.push("*");
		} else {
			this._fields.push(fields);
		}
	} else {
		throw new Error("Unable to append fields because the type was unknown: " + fields);
	}

	return this;
};

method.from = function(table) {
	if (typeof table === "string") {
		this._table = table;

		return this;
	} else {
		Log.E("Unable to set the table because the type was unknown: " + table);

		return this;
	}
};

method.limit = function(offset, limit) {
	this._offset = 0;

	if (offset !== undefined) {
		this._offset = parseInt(offset);
	}

	this._limit = 10;

	if (limit !== undefined) {
		this._limit = limit;
	}

	return this;
};

method.count = function(countFields) {
	if (countFields === undefined) {
		this._countFields.push("*");
	} else if (typeof countFields === "string") {
		if (countFields.length === 0) {
			this._countFields.push("*");
		} else {
			this._countFields.push(countFields);
		}
	} else {
		throw new Error("Not tested nor implemented.");
	}

	this._limit = undefined;
	this._offset = undefined;

	return this;
};

module.exports = QueryBuilder;
