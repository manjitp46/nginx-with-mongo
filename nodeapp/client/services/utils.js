// utilities
var utilsService = function($templateCache, $q, $http, $compile, $modal, $rootScope, $log) {
    var utilServiceMethods = {
        // generic service handler
        successCallBack: function(cb) {
            return function(results) {
                cb(null, null, results)
            }
        },
        errorCallBack: function(cb) {
            return function(err) {
                cb(err, null, null)
            }
        },
        fetchTemplate: function(templateUrl) {
            return $q.when($templateCache.get(templateUrl) || $http.get(templateUrl))
                .then(function(res) {
                    if (angular.isObject(res)) {
                        $templateCache.put(templateUrl, res.data);
                        return res.data;
                    }
                    return res;
                });
        },

        appendTemplate: function(scope, element, templateUrl) {
            utilServiceMethods.fetchTemplate(templateUrl).then(function(templateUrl) {
                element.append($compile(templateUrl)(scope));
            }, function(err) {
                console.log(err)
            });
        },
        getRandom: function(length) {
            return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
        },
        // return a modal instance (refer to angular-bootstrap documentation for more info)
        openModal : function(opts) {
            return $modal.open(opts)
        },

        closeModal : function(modelInstance) {
            modelInstance.close()
        },

        dismissModal : function(modelInstance) {
            modelInstance.dismiss('cancel')
        },
        validateInput: function(routeName, params) {
            var msg = [];
            var constraints = $rootScope.constraints[routeName][routeName];
            if (constraints) {
                if (params) {
                    if (_.isArray(params)) {
                        _.each(params, function(item) {
                            var validateMsg = validate(item, constraints);
                            if (validateMsg) msg.push(validateMsg);
                        });
                    } else {
                        var validateMsg = validate(params, constraints);
                        if (validateMsg) msg.push(validateMsg);
                    }
                }
            } else {
                msg.push('constraints object not found in route configs');
            }
            return msg;
        },
        logger: function(level, message) {
            switch (level) {
                case "log":
                    if ($rootScope.clientDebug) {
                        $log.log(message);
                    }
                    break;
                case "info":
                    if ($rootScope.clientDebug) {
                        $log.info(message);
                    }
                    break;
                case "error":
                    $log.error(message);
                    break;
                case "warn":
                    if ($rootScope.clientDebug) {
                        $log.warn(message);
                    }
                    break;
            }
        },
        isMobile: function() {
            if ($('.navbar-brand .navbar-brand__title').css('display') == 'none') {
                return true;
            } else if ($('.navbar-brand .navbar-brand__title').css('display') != 'inline-block') {
                return false;
            } else {
                return false
            }
        },
        dataURItoBlob: function(dataURI) {
            var arr = dataURI.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]);
            n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], {
                type: mime
            });
        },
        isInteger: function(x) {
            return Math.floor(x) === x;
        },
        isFloat: function(x) {
            return !!(x % 1);
        },
        validatePassword: function(viewValue) {
            var REGEXP_SPECIAL = /[!@#$%^&*?_~]/;
            var REGEXP_LOWER_CASE = /[a-z]/;
            var REGEXP_UPPER_CASE = /[A-Z]/;
            var REGEXP_NUMBER = /[0-9]/;
            if (viewValue && viewValue.length > 7 && REGEXP_SPECIAL.test(viewValue) && REGEXP_LOWER_CASE.test(viewValue) && REGEXP_UPPER_CASE.test(viewValue) && REGEXP_NUMBER.test(viewValue)) {
                return true
            } else {
                return false
            }
        }
    }
    return utilServiceMethods;
};
angular.module('myApp.services').factory('utilsService', ['$templateCache', '$q', '$http', '$compile', '$modal', '$rootScope', '$log', utilsService]);