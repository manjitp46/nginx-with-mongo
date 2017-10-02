"use strict";
var ObjectID = require("mongodb").ObjectID;
var moment = require("moment-timezone");
var broadcaster = require("broadcaster");
var md5 = require("md5");
var _ = require("lodash");
var db = require("./index");
var utils = require("../utils/utils");
var COLLECTION = "history";
global.env = process.env.NODE_ENV || "dev";

function User(obj) {
  this._id = (obj && obj._id) || undefined;
}

User.prototype.getHistory = function(query, cb) {
  console.log("getHistory model");
  var selector = [];
  if (query.id) {
    selector.push({ _id: new ObjectID(query.id) });
  }
  if (query.name) {
    var intermediateSelector = [];
    var elValues = query.name.split(",");
    _.each(elValues, function(el) {
      intermediateSelector.push({ name: el });
    });
    selector.push({
      $or: intermediateSelector
    });
  }
  if (query.type) {
    var intermediateSelector = [];
    var elValues = query.type.split(",");
    _.each(elValues, function(el) {
      intermediateSelector.push({ type: el });
    });
    selector.push({
      $or: intermediateSelector
    });
  }
  if (query.date) {
    var startOfDay = moment(query.date)
      .tz("Asia/Kolkata")
      .startOf("day")
      .toISOString();
    var endOfDay = moment(query.date)
      .tz("Asia/Kolkata")
      .endOf("day")
      .toISOString();
    selector.push({
      time: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
  }

  var finalSelector = {};
  if (selector.length > 0) {
    finalSelector = { $and: selector };
  }
  console.log("mongo query: ", JSON.stringify(finalSelector) + "\n");
  db
    .collection(COLLECTION)
    .find(finalSelector)
    .toArray(utils.handleDBCallback(null, cb));
};

User.prototype.postHistory = function(history, cb) {
  history["addedOn"] = moment().toISOString();
  db
    .collection(COLLECTION)
    .insertOne(history, utils.handleDBCallback(null, cb));
};

module.exports = new User();
