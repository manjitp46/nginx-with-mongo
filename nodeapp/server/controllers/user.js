"use strict";
var ObjectID = require("mongodb").ObjectID;
var broadcaster = require("broadcaster");
var utils = require("../utils/utils");
var userModel = require("../models/user");
var dslog = require("../utils/dslog");
var jwt = require("../models").jwt;
var serverConfigs = require("../configs/serverConfigs");
var _ = require("lodash");

module.exports = {
  getHistory: function(req, res) {
    var selector = {};
    if (!_.isEmpty(req.query)) {
      selector = req.query;
    }
    if (!_.isEmpty(req.params)) {
      selector = req.params;
    }
    userModel.getHistory(selector, function(err, result) {
      if (err) {
        utils.sendResponseForAPI(err, req, res, null);
      } else {
        if (result.length > 0) {
          result = _.sortBy(result, function(history) {
            return new Date(history.time);
          }).reverse();
        }
        utils.sendResponseForAPI(null, req, res, {
          count: result.length,
          documents: result
        });
      }
    });
  },
  postHistory: function(req, res) {
    userModel.postHistory(req.body.data, function(err, result) {
      if (err) {
        utils.sendResponseForAPI(err, req, res, null);
      } else {
        utils.sendResponseForAPI(null, req, res, {
          documents: result
        });
      }
    });
  }
};
