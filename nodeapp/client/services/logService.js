// service for logging
var logService = function(myAppResource,utilsService) {
    return {
        makeLog:function(params,cb) {
            var msg = utilsService.validateInput('makeLog',params);
            if (msg.length == 0) {
                var prm = myAppResource.makeLog(params);
                prm.$promise.then(utilsService.successCallBack(cb),utilsService.errorCallBack(cb));
            } else {
                cb(null,msg,null)
            }
        }
    }
};

angular.module('myApp.services').factory('logService',['myAppResource','utilsService',logService]);