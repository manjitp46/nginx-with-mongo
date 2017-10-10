"use strict";
var ObjectID = require("mongodb").ObjectID;
var broadcaster = require("broadcaster");
var utils = require("../utils/utils");
var orgnisationModel = require("../models/organisation");
var dslog = require("../utils/dslog");
var jwt = require("../models").jwt;
var serverConfigs = require("../configs/serverConfigs");
var _ = require("lodash");

module.exports = {
  getOrganisation: function(req, res) {
    var selector = {};
    if (!_.isEmpty(req.query)) {
      selector = req.query;
    }
    if (!_.isEmpty(req.params)) {
      selector = req.params;
    }
    orgnisationModel.getOrganisation(selector, function(err, result) {
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
  postOrganisation: function(req, res) {
    orgnisationModel.postOrganisation(req.body.data, function(err, result) {
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
