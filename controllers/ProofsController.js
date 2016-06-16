var $                 = require('../util/jquery').$;
var Log               = require('node-android-logging');
var path              = require('path');
var printf            = require('util').format;
var Q                 = require('q');
var Uploads           = require('../models/Uploads');
var UploadReadings    = require('../models/UploadReadings');
var Pagination        = require('../util/pagination');
var sql               = require('../models/sql');
var squel             = require('squel');
var requestExpress    = require('../util/request-express');

var uploadsOpts = {
  "fields": [
    "id",
    "filename",
    "dt"
  ]
};

module.exports.Index = function(request, response) {
  request.limit  = requestExpress.getInt(request, 'limit',  10);
  request.offset = requestExpress.getInt(request, 'offset', 0);

  if (request.limit === undefined) {
    throw new Error("Invalid limit");
  }

  if (request.offset === undefined) {
    throw new Error("Invalid offset");
  }

  var queryString = squel.select()
    .field("id")
    .field("filename")
    .field("dt")
    .from("uploads")
    .offset(request.offset)
    .limit(request.limit)
    .toString();

  Log.I(queryString);

  sql.rawQueryPromise(queryString).then(function(result) {
    response.upload           = result;
    response.resultCount      = result.length;
    response.paginationLimit  = request.limit;
    response.paginationOffset = request.offset;

    return sql.rawQueryPromise(squel.select().field("COUNT(*)", "count").from("uploads").toString());
  }).then(function(result) {
    var uploadCount  = result;

    return new Q.Promise(function(resolve, reject) {
      try {
        var pagination            = new Pagination();

        pagination.setLimit(response.paginationLimit);
        pagination.setOffset(response.paginationOffset);
        pagination.setCount(uploadCount[0].count);

        pagination.buildPages();
        response.pagination = pagination;

        response.paginationLimit = undefined;
        response.paginationOffset = undefined;

        response.render('proofs/Index', response);

        resolve(null);
      } catch (ex) {
        reject(ex);
      }
    });
  }).catch(function(rejection) {
    response.status(500);

    url = request.url;
    response.render('errors/500');
    Log.E(rejection);
  });

  return this;
};

module.exports.ProofById = function(request, response) {
  pc = require('./ProofsController');

  var query = squel.select()
    .from(Uploads.TABLE_NAME)
    .where("id = ?", request.params.id)
    .toString();

  sql.rawQueryPromise(query).then(function (result) {
    return new Q.Promise(function(resolve, reject) {
      Log.E(result);
      if (result.length === 0) {
        response.return = "/proofs/";

        response.status(404).render('errors/404', response);

        reject("No records found by the given ID");
      } else {
        response.result = result[0];

        resolve(result[0]);
      }
    });
  }).then(function(result) {
    var query = squel.select()
      .from("UploadReadings")
      .where("JSON_EXTRACT(ocrParamsJson, \"$.proof\") = true")
      .where("uploadsId = ?", request.params.id)
      .limit(1)
      .toString();

    return sql.rawQueryPromise(query);
  }).then(function(result) {
    response.readings = result;

    return pc._proof(request, response, result);
  }).catch(function(rejection) {
    return pc._error(request, response, rejection);
  });
};

module.exports.SaveById = function(request, response) {
  Log.I(request.body);

  UploadReadings.save({
    id: request.params.id,
    ocrParamsJson: {proof: true},
    dataJson: request.body
  }).then(function(result) {
    console.log(result);

    response.status(200);
    response.send({response: "OK"});
  }).catch(function(rejection) {
    response.status(500);

    url = request.url;
    response.render('errors/500');
    Log.E(rejection);
  });

};

module.exports.NextProof = function(request, response) {
  sql = require('../models/sql');
  pc  = require('./ProofsController');

  return sql.rawQueryPromise(
    "SELECT * FROM uploads WHERE id NOT IN " +
    "(SELECT uploadsId FROM UploadReadings WHERE ocrParamsJson->\"$.proof\" = true)" +
    "ORDER BY id ASC LIMIT 1").then(function(result) {
      response.status(200).send("" + result[0].id);

      resolve();
    }).catch(function(rejection) {
      return pc._error(request, response, rejection);
    });
};

module.exports._proof = function(request, response, result) {
  return new Q.Promise(function(resolve, reject) {
    Log.I(response.result);

    response.render('proofs/Proof', response);

    resolve();
  });
};

module.exports._error = function(request, response, rejection) {
  response.status(500);

  url = request.url;
  response.render('errors/500');
  Log.E(rejection);
};

