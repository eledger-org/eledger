"use strict";

var $                 = require("../util/jquery").$;
var Log               = require("node-android-logging");
var Q                 = require("q");
var Uploads           = require("../models/Uploads");
var Pagination        = require("../util/pagination");
var requestExpress    = require("../util/request-express");

var opts      = {};

module.exports.Index = function(request, response) {
  request.limit  = requestExpress.getInt(request, "limit",  10);
  request.offset = requestExpress.getInt(request, "offset", 0);

  if (request.limit === undefined) {
    throw new Error("Invalid limit");
  }

  Log.I(request.offset);

  if (request.offset === undefined) {
    throw new Error("Invalid offset");
  }

  Uploads.find($.extend(true, {}, opts, request.query)).then(function (result) {
    var foundUploads          = result;

    response.upload           = foundUploads;
    response.resultCount      = foundUploads.length;
    response.paginationLimit  = request.limit;
    response.paginationOffset = request.offset;

    return Uploads.count();
  }).then(function(result) {
    var uploadCount  = result;

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
        response.render("file/Index", response);

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

module.exports.GetFile = function(request, response) {
  response.send("/static/uploads/" + request.params.id);

  return this;
};

