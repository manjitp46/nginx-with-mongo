// http intercept service for error handling

var interceptorService = function($rootScope,$q,$window) {
    return {
        request: function(config) {
            config.timeout = 60000;
            config.headers = config.headers || {};
            if(myAppGlobals.jwt){
                config.headers.authorization = 'Bearer '+ myAppGlobals.jwt;
            }
            return config;
        },
        responseError: function(response) {
          
            var reject
            if (response.status == 500 || response.status == 503 || response.status == 0) {
                $rootScope.$broadcast('event::exception-occurred',response);
                reject = $q.reject(response);
                return reject;
            } else if (response.status == 404 || response.status == 400) {
                reject = $q.reject(response);
                return reject
            } else if (response.status == 403) {
                $window.location = '/';
            } else {
                return response
            }
        },
        response: function(response) {
          
            return response

        }
    }
};

angular.module('myApp.services').factory('interceptorService', ['$rootScope','$q','$window',interceptorService]);