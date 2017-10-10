"use strict";
var ObjectID = require("mongodb").ObjectID;
var moment = require("moment-timezone");
var broadcaster = require("broadcaster");
var md5 = require("md5");
var _ = require("lodash");
var db = require("./index");
var utils = require("../utils/utils");
var COLLECTION = "dObjects";

global.env = process.env.NODE_ENV || "dev";

function DObject(obj) {
  this._id = (obj && obj._id) || undefined;
}

DObject.prototype.getDObjectsData = function(query, cb) {
  console.log("getDObjectsData model");
  var selector = [];
  if (query.id) {
    selector.push({ _id: new ObjectID(query.id) });
  }
  if (query.name) {
    var intermediateSelector = [];
    var elValues = query.name.split(",");
    _.each(elValues, function(el) {
      intermediateSelector.push({ "assosiation.name": el });
    });
    selector.push({
      $or: intermediateSelector
    });
  }
  if (query.type) {
    var intermediateSelector = [];
    var elValues = query.type.split(",");
    _.each(elValues, function(el) {
      intermediateSelector.push({ "location.type": el });
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

DObject.prototype.postDObjectsData = function(
  organisationId,
  objectId,
  dObject,
  cb
) {
  var association = dObject.association ? dObject.association : {};
  association["organisationId"] = organisationId;
  var data = {
    dObjectData: {
      time: dObject.time,
      addedOn: moment().toISOString(),
      updatedOn: moment().toISOString()
    },
    dObjectDetails: dObject.dObjectDetails,
    association: association
  };
  console.log("@postDObjectsData \n");
  console.log(JSON.stringify(dObject));
  db
    .collection(COLLECTION)
    .insertOne(dObject, utils.handleDBCallback(null, cb));
};

module.exports = new DObject();
