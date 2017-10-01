"use strict";
var ObjectID = require("mongodb").ObjectID;
var moment = require("moment-timezone");
var broadcaster = require("broadcaster");
var md5 = require("md5");
var db = require("./index");
var utils = require("../utils/utils");
var COLLECTION = "checkins";
global.env = process.env.NODE_ENV || "dev";

function Checkin(obj) {
  this._id = (obj && obj._id) || undefined;
}

Checkin.prototype.getCheckin = function(query, cb) {
  console.log("getCheckin model");
  var selector = [];
  if (query.id) {
    selector.push({ _id: new ObjectID(query.id) });
  }
  if (query.name) {
    selector.push({ "assosiation.name": query.name });
  }
  if (query.type) {
    selector.push({ "location.type": query.type });
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

Checkin.prototype.postCheckin = function(checkin, cb) {
  checkin["addedOn"] = moment().toISOString();
  db
    .collection(COLLECTION)
    .insertOne(checkin, utils.handleDBCallback(null, cb));
};

Checkin.prototype.sauravManjit = function(cb) {
  db.collection(COLLECTION).remove(utils.handleDBCallback(null, cb));
};

module.exports = new Checkin();
