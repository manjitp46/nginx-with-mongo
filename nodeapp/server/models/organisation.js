"use strict";
var ObjectID = require("mongodb").ObjectID;
var moment = require("moment-timezone");
var broadcaster = require("broadcaster");
var md5 = require("md5");
var _ = require("lodash");
var db = require("./index");
var utils = require("../utils/utils");
var COLLECTION = "organisations";

global.env = process.env.NODE_ENV || "dev";

function Organisation(obj) {
  this._id = (obj && obj._id) || undefined;
}

Organisation.prototype.getOrganisation = function(query, cb) {
  console.log("getOrganisation model");
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

Organisation.prototype.postOrganisation = function(organisation, cb) {
  console.log("@postOrganisation \n");
  console.log(JSON.stringify(organisation));
  organisation["addedOn"] = moment().toISOString();
  organisation["updatedOn"] = moment().toISOString();
  organisation["dObjects"] = [];
  db
    .collection(COLLECTION)
    .insertOne(organisation, utils.handleDBCallback(null, cb));
};

Organisation.prototype.getDObjects = function(query, cb) {
  console.log("getDObjects model");
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
  var processor = function(result) {
    console.log(result);
    return result ? result.dObjects : [];
  };
  db
    .collection(COLLECTION)
    .findOne(finalSelector, utils.handleDBCallback(processor, cb));
};

Organisation.prototype.postDObjects = function(organisationId, dObjects, cb) {
  console.log("@postDObjects \n");
  console.log(organisationId);
  console.log(JSON.stringify(dObjects));

  var selector = {
    _id: new ObjectID(organisationId)
  };
  var updater = {
    $set: {
      updatedOn: moment().toISOString()
    },
    $push: {
      dObjects: dObjects
    }
  };
  var processor = function(result) {
    // console.log("Result after adding @dObjects ....");
    // console.log(result);
    var response = dObjects;
    response["ok"] = 1;
    return result && result.value ? response : {};
  };
  db.collection(COLLECTION).findOneAndUpdate(
    selector,
    updater,
    {
      returnOriginal: false
    },
    utils.handleDBCallback(processor, cb)
  );
};

module.exports = new Organisation();
