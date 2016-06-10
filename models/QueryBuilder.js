var Log      = require('../util/log');
var method   = QueryBuilder.prototype;
var Q        = require('q');

function QueryBuilder() {
  this._queryType         = undefined;

  /** Common fields **/
  this._table             = "";
  this._joins             = [];
  this._where             = [];
  this._orderByFields     = [];

  /** Select fields **/
  this._selectFields      = [];
  this._countFields       = [];
  this._limit             = 10;
  this._offset            = 0;

  /** Insert fields **/
  this._insertFields      = [];
  this._insertValues      = [];

  /** Update fields **/
  this._setKeyValuePairs     = [];

  this.SELECT_QUERY_TYPE  = "SELECT_QUERY_TYPE";
  this.INSERT_QUERY_TYPE  = "INSERT_QUERY_TYPE";
  this.UPDATE_QUERY_TYPE  = "UPDATE_QUERY_TYPE";
}

method.getLimit       = function() { return this._limit; };
method.getOffset      = function() { return this._offset; };

method.queryPromise   = function() {
  var qb = this;

  if (this._queryType === this.SELECT_QUERY_TYPE) {
    return qb.queryPromiseSelect();
  } else if (this._queryType === this.INSERT_QUERY_TYPE) {
    return qb.queryPromiseInsert();
  } else if (this._queryType === this.UPDATE_QUERY_TYPE) {
    return qb.queryPromiseUpdate();
  } else {
    err = new Error("Query Type was %s.  Call QueryBuilder.select/insert/update/delete instead of whatever you did.", this._queryType);

    Log.E(err);

    throw err;
  }
}

method.queryPromiseUpdate = function() {
  var qb = this;

  return new Q.Promise(function(resolve, reject) {
    var q = "";
    var queryParams = [];

    if (qb._table !== undefined) {
      q = "UPDATE ??";
      queryParams.push(qb._table);
    } else {
      err = new Error("Please specify QueryBuilder._table");
      err.extraInfo.queryInfo = {"query": q, "params": queryParams};

      reject(err);
    }

    if (qb._setKeyValuePairs.length > 0) {
      for (kvp = 0; kvp < qb._setKeyValuePairs.length; ++kvp) {
        if (kvp === 0) {
          q = q + " SET ?? = ?";
          queryParams.push(qb._setKeyValuePairs[kvp].key);
          queryParams.push(qb._setKeyValuePairs[kvp].value);
        } else {
          q = q + ", ?? = ?";
          queryParams.push(qb._setKeyValuePairs[kvp].key);
          queryParams.push(qb._setKeyValuePairs[kvp].value);
        }
      }
    } else {
      err = new Error("No update instructions... Use QueryBuilder().set");

      Log.E(err);

      reject(err);
    }

    if (qb._where.length !== 0) {
      q = q + " WHERE";

      for (whereIter = 0; whereIter < qb._where.length; ++whereIter) {
        append_q = "";

        if (whereIter > 0) {
          append_q += " AND";
        }

        if (qb._where[whereIter].columnType === 'json') {
          append_q += " json_extract(??, ?) OPERAND ?".replace(/(OPERAND)/, qb._where[whereIter].operand);

          queryParams.push(qb._where[whereIter].columnName);
          queryParams.push(qb._where[whereIter].jsonKey);
        } else {
          append_q += " ?? OPERAND ?".replace(/(OPERAND)/, qb._where[whereIter].operand);

          if (qb._where[whereIter].columnNameTextReplace) {
            append_q = append_q.replace(/\?\?/, qb._where[whereIter].columnName);
          } else {
            queryParams.push(qb._where[whereIter].columnName);
          }
        }

        queryParams.push(qb._where[whereIter].value);

        q = q + append_q;
      }
    }

    resolve({"query": q, "params": queryParams, "qb": qb});
  }).then(function (resolution) {
    var queryInfo = resolution;
    var qb        = resolution.qb;

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
};

method.queryPromiseInsert = function() {
  var qb = this;

  return new Q.Promise(function(resolve, reject) {
    var q = "";
    var queryParams = [];

    if (qb._table !== undefined) {
      q = "INSERT INTO ??";
      queryParams.push(qb._table);
    } else {
      err = new Error("Please specify QueryBuilder._table");
      err.extraInfo.queryInfo = {"query": q, "params": queryParams};

      reject(err);
    }

    if (qb._insertFields.length > 0) {
      q = q + " (??)";
      queryParams.push(qb._insertFields);
    } else {
      err = new Error("Please specify QueryBuilder._insertFields");
      err.extraInfo.queryInfo = {"query": q, "params": queryParams};

      reject(err);
    }

    if (qb._insertValues.length > 0) {
      q = q + " VALUES ?";
      queryParams.push(qb._insertValues);
    }

    resolve({"query": q, "params": queryParams, "qb": qb});
  }).then(function (resolution) {
    var queryInfo = resolution;
    var qb        = resolution.qb;

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
};

method.queryPromiseSelect = function() {
  var qb = this;

  return new Q.Promise(function(resolve, reject) {
    var q = "";
    var queryParams = [];

    if (qb._selectFields.length === 0 && qb._countFields.length === 0) {
      qb._selectFields.push("*");

      q = q + "SELECT ??";
    } else {
      if (qb._selectFields.length > 0 && qb._countFields.length > 0) {
        q = q + "SELECT ??, COUNT(??) as count";

        queryParams.push(qb._selectFields);
        queryParams.push(qb._countFields);
      } else {
        if(qb._selectFields.length !== 0) {
          q = q + "SELECT ??";

          queryParams.push(qb._selectFields);
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
      q = q + " WHERE";

      for (whereIter = 0; whereIter < qb._where.length; ++whereIter) {
        append_q = "";

        if (whereIter > 0) {
          append_q += " AND";
        }

        if (qb._where[whereIter].columnType === 'json') {
          append_q += " json_extract(??, ?) OPERAND ?".replace(/(OPERAND)/, qb._where[whereIter].operand);

          queryParams.push(qb._where[whereIter].columnName);
          queryParams.push(qb._where[whereIter].jsonKey);
        } else {
          append_q += " ?? OPERAND ?".replace(/(OPERAND)/, qb._where[whereIter].operand);

          if (qb._where[whereIter].columnNameTextReplace) {
            append_q = append_q.replace(/\?\?/, qb._where[whereIter].columnName);
          } else {
            queryParams.push(qb._where[whereIter].columnName);
          }
        }

        queryParams.push(qb._where[whereIter].value);

        q = q + append_q;
      }
    }

    if (qb._orderByFields.length !== 0) {
      q = q + "ORDER BY ??";

      queryParams.push(qb._orderByFields);
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
    var qb        = resolution.qb;

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
    this._selectFields.push("*");
  } else if (typeof fields === "string") {
    if (fields.length === 0) {
      this._selectFields.push("*");
    } else {
      this._selectFields.push(fields);
    }
  } else if (Array.isArray(fields)) {
    if (fields.length === 0) {
      this._selectFields.push("*");
    } else {
      this._selectFields.push(fields);
    }
  } else {
    throw new Error("Unable to append fields because the type was unknown: " + fields);
  }

  this._queryType = this.SELECT_QUERY_TYPE;

  return this;
};

method.insert = function(table) {
  if (typeof table === "string") {
    this._table = table;

    this._queryType = this.INSERT_QUERY_TYPE;
  } else {
    Log.E("Unable to set the table because the table type was unknown: " + table);
  }

  return this;
};

// This is an insert method for specifying the fields of the table that will be provided for each insertion row
method.fields = function(fields) {
  if (typeof fields === "string") {
    this._insertFields.push(fields);
  } else if (Array.isArray(fields)) {
    this._insertFields = fields;
  } else {
    Log.E("Unable to set the table because the fields type was unknown: " + fields);
  }

  return this;
};

// This is an insert method for specifying the values to insert.
//
// var queryBuilder = new QueryBuilder();
//  Single Row, Single column:
//    queryBuilder.insert('bla').fields('blacol').values('blaval');
//
//  Single Row:
//    queryBuilder.insert('bla').fields(['blacol1', 'blacol2']).values(['blaval1', 'blaval2']);
//
//  Multiple Rows:
//    queryBuilder.insert('bla').fields('blacol').values([ [ 'blaval1' ], [ 'blaval2' ] ]);
method.values = function(values) {
  if (typeof values === "string") {
    this._insertValues.push(values);
  } else if (Array.isArray(values)) {
    if (Array.isArray(values[0])) {
      this._insertValues = values;
    } else {
      this._insertValues.push(values);
    }
  } else {
    Log.E("Unable to set the table because the values type was unknown: " + values);
  }

  return this;
};

method.update = function(table) {
  if (typeof table === "string") {
    this._table = table;

    this._queryType = this.UPDATE_QUERY_TYPE;
  } else {
    Log.E("Unable to set the table because the type was unknown: " + table);
  }

  return this;
};

method.set = function(keyValuePairs) {
  if (Array.isArray(keyValuePairs)) {
    this._setKeyValuePairs = keyValuePairs;
  } else {
    Log.E("Unable to set the table because the type was unknown: " + keyValuePairs);
  }

  return this;
};

method.from = function(table) {
  if (typeof table === "string") {
    this._table = table;
  } else {
    Log.E("Unable to set the table because the type was unknown: " + table);
  }

  return this;
};

method.where = function(where) {
  if (!Array.isArray(where) || where.length <= 0) {
    Log.E(where);
    Log.E("Please pass an array like [{\"columnName\": \"id\", \"value\": 1, \"operand\": \"=\"}] to create WHERE id = 1");
  } else {
    for (whereIter = 0; whereIter < where.length; ++whereIter) {
      wh = where[whereIter];

      if (wh.columnName !== undefined && wh.value !== undefined && wh.operand !== undefined) {
        if (wh.operand === "=" || wh.operand === "LIKE") {
          this._where.push(wh);
        }
      }
    }
  }

  return this;
};

method.limit = function(offset, limit) {
  this._offset = 0;

  if (offset !== undefined) {
    this._offset = parseInt(offset);
  }

  this._limit = 10;

  if (limit !== undefined) {
    if (isNaN(limit)) {
      this._limit = undefined;
    } else {
      this._limit = limit;
    }
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
    Log.E("This type is not tested nor implemented.");
    throw new Error("Not tested nor implemented.");
  }

  this._limit = undefined;
  this._offset = undefined;
  this._queryType = this.SELECT_QUERY_TYPE;

  return this;
};

method.orderBy = function(orderByFields) {
  if (orderByFields === undefined) {
    Log.E("Tried to order by an undefined field.");
  } else if (typeof orderByFields === "string") {
    this._orderByFields.push(orderByFields);
  } else if (Array.isArray(orderByFields)) {
    this._orderByFields = $.extend(true, {}, this._orderByFields, orderByFields);
  } else {
    Log.E("This type is not tested nor implemented.");
    throw new Error("Not tested nor implemented.");
  }

  return this;
};

module.exports = QueryBuilder;
