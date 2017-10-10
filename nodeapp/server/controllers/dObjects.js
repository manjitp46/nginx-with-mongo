"use strict";
var ObjectID = require("mongodb").ObjectID;
var broadcaster = require("broadcaster");
var utils = require("../utils/utils");
var orgnisationModel = require("../models/organisation");
var dObjectsModel = require("../models/dObjects");
var dslog = require("../utils/dslog");
var jwt = require("../models").jwt;
var serverConfigs = require("../configs/serverConfigs");
var _ = require("lodash");

module.exports = {
  getDObjects: function(req, res) {
    console.log("params", JSON.stringify(req.params));
    console.log("query", JSON.stringify(req.query));
    var selector = {};
    if (!_.isEmpty(req.query)) {
      selector = req.query;
    }
    if (!_.isEmpty(req.params)) {
      selector = req.params;
    }
    orgnisationModel.getDObjects(selector, function(err, result) {
      if (err) {
        utils.sendResponseForAPI(err, req, res, null);
      } else {
        if (result.length > 0) {
          result = _.sortBy(result, function(organisation) {
            return new Date(organisation.updatedOn);
          }).reverse();
        }
        utils.sendResponseForAPI(null, req, res, {
          count: result.length,
          documents: result
        });
      }
    });
  },
  postDObjects: function(req, res) {
    console.log("params", JSON.stringify(req.params));
    orgnisationModel.postDObjects(req.params.id, req.body.dObjects, function(
      err,
      result
    ) {
      if (err) {
        utils.sendResponseForAPI(err, req, res, null);
      } else {
        utils.sendResponseForAPI(null, req, res, {
          documents: result
        });
      }
    });
  },
  getDObjectsData: function(req, res) {
    console.log("params", JSON.stringify(req.params));
    console.log("query", JSON.stringify(req.query));
    var selector = {};
    if (!_.isEmpty(req.query)) {
      selector = req.query;
    }
    if (!_.isEmpty(req.params)) {
      selector = req.params;
    }
    dObjectsModel.getDObjectsData(selector, function(err, result) {
      if (err) {
        utils.sendResponseForAPI(err, req, res, null);
      } else {
        if (result.length > 0) {
          result = _.sortBy(result, function(organisation) {
            return new Date(organisation.updatedOn);
          }).reverse();
        }
        utils.sendResponseForAPI(null, req, res, {
          count: result.length,
          documents: result
        });
      }
    });
  },
  postDObjectsData: function(req, res) {
    console.log("params", JSON.stringify(req.params));
    console.log("query", JSON.stringify(req.query));
    dObjectsModel.postDObjectsData(
      req.params.id,
      req.params.objectId,
      req.body.data,
      function(err, result) {
        if (err) {
          utils.sendResponseForAPI(err, req, res, null);
        } else {
          utils.sendResponseForAPI(null, req, res, {
            documents: result
          });
        }
      }
    );
  }
};
