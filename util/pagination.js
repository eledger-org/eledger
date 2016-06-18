"use strict";

/** The purpose of this script is to standardize the API to interact with the pagination functionality on the client **/
var Log = require("node-android-logging");

var method   = Pagination.prototype;

function Pagination() {
  this._pages   = [];
  this._count   = 0;
  this._offset  = 0;
  this._limit   = 0;
}

/** Like mysql COUNT(*) **/
method.setCount = function(count) {
  this._count = count;
};

/** Like mysql offset **/
method.setOffset = function(offset) {
  this._offset = offset;
};

/** Like mysql Limit **/
method.setLimit = function(limit) {
  this._limit = limit;
};

/** Builds the pagination object **/
method.buildPages = function() {
  if (this._limit <= 0) {
    /** This case would cause an infinite loop **/
    Log.E("Cannot build pages while limit <= 0");

    return;
  }

  var pageNumber = 0;
  var paginationIter;

  for (paginationIter = 0; paginationIter < this._count; paginationIter += this._limit) {
    pageNumber += 1;
    if (this._offset >= paginationIter && this._offset < paginationIter + this._limit) {
      this._pages.push({"class": "page-item active", "offset": paginationIter, "pageNumber": pageNumber});
    } else {
      this._pages.push({"class": "page-item", "offset": paginationIter, "pageNumber": pageNumber});
    }
  }

  return this._pages;
};

module.exports = Pagination;

