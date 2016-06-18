"use strict";

var LedgerEntries     = require("../models/LedgerEntries");
var Log               = require("node-android-logging");
var Pagination        = require("../util/pagination");
var requestExpress    = require("../util/request-express");
var sql               = require("../models/sql");
var squel             = require("squel");

module.exports.LedgersViewsPro = function(request, response) {
  request.limit  = requestExpress.getInt(request, "limit",  10);
  request.offset = requestExpress.getInt(request, "offset", 0);

  if (request.limit === undefined) {
    throw new Error("Invalid limit");
  }

  Log.I(request.offset);

  if (request.offset === undefined) {
    throw new Error("Invalid offset");
  }

  var pagination = new Pagination();

  pagination.setLimit(request.limit);
  pagination.setOffset(request.offset);

  response.pagination = pagination;

  // This is the callback we'll use to render the ledger
  response.renderLedger = function renderLedger(result, count) {
    this.pagination.setCount(count);
    this.pagination.buildPages();

    Log.I(result);
    response.ledgerEntries = result;

    response.render("ledgers/pro", response);
  };

  LedgerEntries.count().then(function(result) {
    response.count = result[0].count;

    let ledgerEntriesQuery = squel.select()
      .field("FROM_UNIXTIME(generalLedgerDate, '%Y-%m-%d')", "date-YYYY-MM-DD")
      .field("description")
      .field("account")
      .field("credit")
      .field("debit")
      .from(LedgerEntries.TABLE_NAME)
      .limit(request.limit)
      .offset(request.offset)
      .toString();

    Log.I(ledgerEntriesQuery);

    return sql.rawQueryPromise(ledgerEntriesQuery).then(function(result) {
      response.renderLedger(result, response.count);
    });
  }).catch(function(rejection) {
    response.status(500);

    response.render("errors/500");
    Log.E(rejection);
  });
};
