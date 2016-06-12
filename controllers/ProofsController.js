var $                 = require('../util/jquery').$;
var Log               = require('node-android-logging');
var path              = require('path');
var printf            = require('util').format;
var Q                 = require('q');
var Uploads           = require('../models/Uploads');
var UploadReadings    = require('../models/UploadReadings');
var Pagination        = require('../util/pagination');

var uploadsOpts = {
  "fields": [
    "id",
    "filename",
    "dt"
  ]
};

var uploadReadingOpts = {
};

module.exports.Index = function(request, response) {
  Uploads.find($.extend(true, {}, uploadsOpts, request.query)).then(function (result) {
    var foundUploads          = result.rows;
    var queryInfo             = result.queryInfo;
    var queryBuilder          = result.queryBuilder;

    response.upload           = foundUploads;
    response.resultCount      = foundUploads.length;
    response.paginationLimit  = queryBuilder.getLimit();
    response.paginationOffset = queryBuilder.getOffset();

    return Uploads.count();
  }).then(function(result) {
    var uploadCount  = result.rows;

    return new Q.Promise(function(resolve, reject) {
      try {
        var pagination            = new Pagination();

        pagination.setLimit(response.paginationLimit);
        pagination.setOffset(response.paginationOffset);
        pagination.setCount(uploadCount[0].count);

        //response.pages = pagination.buildPages();
        pagination.buildPages();
        response.pagination = pagination;

        response.paginationLimit = undefined;
        response.paginationOffset = undefined;

        Log.I(response);
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

  var byIdOpts = $.extend(true, {}, uploadsOpts, request.query);

  byIdOpts.limit = 1;
  byIdOpts.where = [
    {
      "columnName": "id",
      "value": request.params.id,
      "operand": "="
    }
  ];

  Log.I(byIdOpts);
  Uploads.find(byIdOpts).then(function (result) {
    return new Q.Promise(function(resolve, reject) {
      response.result = result.rows[0];

      resolve(result.rows[0]);
    });
  }).then(function(result) {
    var uploadReadingsOpts = $.extend(true, {}, uploadReadingsOpts, request.query);

    uploadReadingsOpts.limit = NaN;
    uploadReadingsOpts.where = [
      {
        "columnName": "uploadsId",
        "value": request.params.id,
        "operand": "="
      },
      {
        "columnNameTextReplace": true,
        "columnName": "ocrParamsJson->\"$.proof\"",
        "value": true,
        "operand": "="
      }
    ];

    return UploadReadings.find(uploadReadingsOpts);
  }).then(function(result) {
    response.readings = result.rows;

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

