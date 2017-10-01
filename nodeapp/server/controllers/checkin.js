"use strict";
var ObjectID = require("mongodb").ObjectID;
var broadcaster = require("broadcaster");
var utils = require("../utils/utils");
var checkinModel = require("../models/checkin");
var dslog = require("../utils/dslog");
var jwt = require("../models").jwt;
var serverConfigs = require("../configs/serverConfigs");
var _ = require("lodash");

module.exports = {
  getCheckin: function(req, res) {
    checkinModel.getCheckin(function(err, result) {
      if (err) {
        utils.sendResponseForAPI(err, req, res, null);
      } else {
        utils.sendResponseForAPI(null, req, res, {
          data: result
        });
      }
    });
  },
  postCheckin: function(req, res) {
    checkinModel.postCheckin(req.body.data, function(err, result) {
      if (err) {
        utils.sendResponseForAPI(err, req, res, null);
      } else {
        utils.sendResponseForAPI(null, req, res, {
          data: result
        });
      }
    });
  },
  sauravManjit: function(req, res) {
    checkinModel.sauravManjit(function(err, result) {
      if (err) {
        utils.sendResponseForAPI(err, req, res, null);
      } else {
        utils.sendResponseForAPI(null, req, res, {
          data: result
        });
      }
    });
  }
};
