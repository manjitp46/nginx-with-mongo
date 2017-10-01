// This file will have all the routes configured for this app
var routesList = require("./routesList").routesList;
var _ = require("lodash");
var utils = require("../utils/utils");
var validate = require("validate.js");
var jwt = require("../models").jwt;
var serverConfigs = require("../configs/serverConfigs");

module.exports = {
  configureRoutes: function(app) {
    var authenticateRoute = function(isSecured) {
      next();
    };
    var verifyJwtToken = function(tokenRequired) {
      next();
    };
    var checkPermissions = function(accessTo) {
      next();
    };
    // use routeName as the object key for data posted in the body for POST and PUT
    var checkConstraints = function(route) {
      return function(req, res, next) {
        var constraints = route.constraints;
        var routeName = route.routeName;
        var params;
        switch (req.method) {
          case "GET":
          case "DELETE":
            params = req.params;
            break;
          case "POST":
          case "PUT":
            params = req.body[routeName];
            break;
        }

        var msg = [];
        if (params) {
          if (constraints) {
            var validateMsg = validate(params, constraints);
            if (validateMsg) msg.push(validateMsg);
          } else {
            msg.push("constraints object not found in route configs");
          }
        } else {
          msg.push("params not present in get / post");
        }

        if (msg.length == 0) {
          next();
        } else {
          var error = {
            ndmStatusCode: 400,
            ndmStatusMessage: JSON.stringify(msg)
          };
          utils.sendResponseForAPI(error, req, res, null);
        }
      };
    };
    // console.log('configuring routes')
    _.each(routesList, function(route) {
      var handler = require("../controllers/" + route.routeController);
      var routeHandler;
      route.routeHandler
        ? (routeHandler = route.routeHandler)
        : (routeHandler = route.routeMethod);
      switch (route.routeMethod) {
        case "get":
          app.get(route.routeUrl, handler[routeHandler]);
          break;
        case "post":
          app.post(route.routeUrl, handler[routeHandler]);
          break;
        case "put":
          app.put(
            route.routeUrl,
            authenticateRoute(route.isSecured),
            verifyJwtToken(route.tokenRequired),
            checkPermissions(route.accessTo),
            handler[routeHandler]
          );
          break;
        case "delete":
          app.delete(
            route.routeUrl,
            authenticateRoute(route.isSecured),
            verifyJwtToken(route.tokenRequired),
            checkPermissions(route.accessTo),
            handler[routeHandler]
          );
          break;
      }
    });
  }
};
