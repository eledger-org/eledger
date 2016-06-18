"use strict";

var Log               = require("node-android-logging");
var Q                 = require("q");
var Uploads           = require("../models/Uploads");
var UploadReadings    = require("../models/UploadReadings");
var Pagination        = require("../util/pagination");
var sql               = require("../models/sql");
var squel             = require("squel");
var requestExpress    = require("../util/request-express");

var proofsController;

module.exports.Index = function(request, response) {
  request.limit  = requestExpress.getInt(request, "limit",  10);
  request.offset = requestExpress.getInt(request, "offset", 0);

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
    .from(Uploads.TABLE_NAME)
    .offset(request.offset)
    .limit(request.limit)
    .toString();

  Log.I(queryString);

  sql.rawQueryPromise(queryString).then(function(result) {
    response.upload           = result;
    response.resultCount      = result.length;
    response.paginationLimit  = request.limit;
    response.paginationOffset = request.offset;

    return sql.rawQueryPromise(squel.select().field("COUNT(*)", "count").from(Uploads.TABLE_NAME).toString());
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

        response.render("proofs/Index", response);

        resolve(null);
      } catch (ex) {
        reject(ex);
      }
    });
  }).catch(function(rejection) {
    response.status(500);

    response.render("errors/500");
    Log.E(rejection);
  });

  return this;
};

module.exports.ProofById = function(request, response) {
  proofsController = require("./ProofsController");

  var query = squel.select()
    .from(Uploads.TABLE_NAME)
    .where("id = ?", request.params.id)
    .toString();

  sql.rawQueryPromise(query).then(function (result) {
    if (result.length === 0) {
      return new Q.Promise(function(resolve, reject) {
        response.return = "/proofs/";

        response.status(404).render("errors/404", response);

        reject({
          "handled": true
        });
      });
    } else {
      var query = squel.select()
        .from("UploadReadings")
        .where("JSON_EXTRACT(ocrParamsJson, \"$.proof\") = true")
        .where("uploadsId = ?", request.params.id)
        .limit(1)
        .toString();

      // TODO Rename this result parameter to something more meaningful like
      //  'image id' or whatever it even is
      response.result = result[0];

      return sql.rawQueryPromise(query);
    }
  }).then(function(result) {
    response.readings = result;

    return proofsController._proof(request, response);
  }).catch(function(rejection) {
    return proofsController._error(request, response, rejection);
  });
};

module.exports.SaveById = function(request, response) {
  Log.I(request.body);

  UploadReadings.save({
    id: request.params.id,
    ocrParamsJson: {proof: true},
    dataJson: request.body
  }).then(function() {
    response.status(200);
    response.send({response: "OK"});
  }).catch(function(rejection) {
    response.status(500);

    response.render("errors/500");
    Log.E(rejection);
  });

};

module.exports.NextProof = function(request, response) {
  sql = require("../models/sql");
  proofsController  = require("./ProofsController");

  let query = squel.select()
    .from(Uploads.TABLE_NAME)
    .where("id NOT IN ?", squel.select()
      .field("uploadsId")
      .from(UploadReadings.TABLE_NAME)
      .where("JSON_EXTRACT(ocrParamsJson, \"$.proof\") = true"))
    .order("id", true)
    .limit(1)
    .toString();

  Log.I(query);

  return sql.rawQueryPromise(query).then(function(result) {
    return new Q.Promise(function(resolve, reject) {
      response.status(200).send("" + result[0].id);

      resolve();
    });
  }).catch(function(rejection) {
    return proofsController._error(request, response, rejection);
  });
};

module.exports._proof = function(request, response) {
  return new Q.Promise(function(resolve, reject) {
    Log.I(response.result);

    response.render("proofs/Proof", response);

    resolve();
  });
};

module.exports._error = function(request, response, rejection) {
  response.status(500);

  response.render("errors/500");
  Log.E(rejection);
};

