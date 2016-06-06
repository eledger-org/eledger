var $           = require('../util/jquery').$;
var Log         = require('../util/log');
var path        = require('path');
var printf      = require('util').format;
var Q           = require('q');
var Uploads     = require('../models/Uploads');
var Pagination  = require('../util/pagination');

var opts      = {};

module.exports.Index = function(request, response) {
  Uploads.find($.extend(true, {}, opts, request.query)).then(function (result) {
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
        response.render('file/Index', response);

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

module.exports.GetFile = function(request, response) {
  response.send('/static/uploads/' + request.params.id);

  return this;
};

