var _ = require("lodash");
var constraints = require("../configs/constraints");
module.exports = {
  routesList: [
    {
      routeName: "home",
      routeUrl: "/",
      routeMethod: "get",
      routeController: "index",
      routeHandler: null,
      accessTo: "*",
      isSecured: false,
      tokenRequired: false,
      isArray: false,
      cache: false,
      data: null,
      params: {},
      constraints: constraints["home"]
    },
    {
      routeName: "getCheckin",
      routeUrl: "/checkin",
      routeMethod: "get",
      routeController: "checkin",
      routeHandler: "getCheckin",
      accessTo: "*",
      isSecured: false,
      tokenRequired: false,
      isArray: false,
      cache: false,
      data: {},
      params: {},
      constraints: constraints["home"]
    },
    {
      routeName: "getCheckin",
      routeUrl: "/checkin/:id",
      routeMethod: "get",
      routeController: "checkin",
      routeHandler: "getCheckin",
      accessTo: "*",
      isSecured: false,
      tokenRequired: false,
      isArray: false,
      cache: false,
      data: {},
      params: {},
      constraints: constraints["home"]
    },
    {
      routeName: "postCheckin",
      routeUrl: "/checkin",
      routeMethod: "post",
      routeController: "checkin",
      routeHandler: "postCheckin",
      accessTo: "*",
      isSecured: false,
      tokenRequired: false,
      isArray: false,
      cache: false,
      data: {},
      params: {},
      constraints: constraints["home"]
    },
    {
      routeName: "sauravManjit",
      routeUrl: "/sauravManjit",
      routeMethod: "get",
      routeController: "checkin",
      routeHandler: "sauravManjit",
      accessTo: "*",
      isSecured: false,
      tokenRequired: false,
      isArray: false,
      cache: false,
      data: {},
      params: {},
      constraints: constraints["home"]
    }
  ],
  getResources: function() {
    var resourceDict = {};
    _.each(module.exports.routesList, function(route) {
      var constraints = {};
      constraints[route.routeName] = route.constraints;
      resourceDict[route.routeName] = {
        url: route.routeUrl,
        method: route.routeMethod.toUpperCase(),
        isArray: route.isArray,
        cache: route.cache,
        data: route.data,
        params: route.params,
        constraints: constraints
      };
    });
    return resourceDict;
  }
};
