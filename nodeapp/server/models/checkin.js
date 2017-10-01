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
  var selector = {};
  if (query.id) {
    selector = { _id: new ObjectID(query.id) };
  } else if (query.name) {
    selector = { "assosiation.name": query.name };
  } else if (query.date) {
    var nextDate = new Date(query.date);
    nextDate.setDate(nextDate.getDate() + 1);
    selector = {
      time: {
        $gte: new Date(query.date).toISOString(),
        $lte: new Date(nextDate).toISOString()
      }
    };
  }

  console.log("selector: ", JSON.stringify(selector) + "\n");
  db
    .collection(COLLECTION)
    .find(selector)
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
