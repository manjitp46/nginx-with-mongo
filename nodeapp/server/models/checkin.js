"use strict";
var ObjectID = require("mongodb").ObjectID;
var db = require("./index");
var utils = require("../utils/utils");
var broadcaster = require("broadcaster");
var md5 = require("md5");
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
    var nextDate = new Date(query.date);
    nextDate.setDate(nextDate.getDate() + 1);
    selector.push({
      time: {
        $gte: new Date(query.date).toISOString(),
        $lte: new Date(nextDate).toISOString()
      }
    });
  }

  var finalSelector = { $and: selector };
  console.log("mongo query: ", JSON.stringify(finalSelector) + "\n");
  db
    .collection(COLLECTION)
    .find(finalSelector)
    .toArray(utils.handleDBCallback(null, cb));
};

Checkin.prototype.postCheckin = function(checkin, cb) {
  checkin["addedOn"] = new Date().toISOString();
  console.log(checkin);
  db
    .collection(COLLECTION)
    .insertOne(checkin, utils.handleDBCallback(null, cb));
};

Checkin.prototype.sauravManjit = function(cb) {
  db.collection(COLLECTION).remove(utils.handleDBCallback(null, cb));
};

module.exports = new Checkin();
