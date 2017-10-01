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

Checkin.prototype.getCheckin = function(cb) {
  db
    .collection(COLLECTION)
    .find()
    .toArray(utils.handleDBCallback(null, cb));
};

Checkin.prototype.postCheckin = function(checkin, cb) {
  db
    .collection(COLLECTION)
    .insertOne(checkin, utils.handleDBCallback(null, cb));
};

Checkin.prototype.sauravManjit = function(cb) {
  db.collection(COLLECTION).remove(utils.handleDBCallback(null, cb));
};

module.exports = new Checkin();
