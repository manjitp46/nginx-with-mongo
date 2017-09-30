// declare all the global modules here. Each factory should register itself with the respective module.
// example directives should register itself with myApp.directives
angular.module('myApp.directives', []);
angular.module('myApp.services', []);
angular.module('myApp.resources', ['ngResource']);
angular.module('myApp.controllers', []);
angular.module('myApp.filters', []);

// array of modules to register with the main app
var modulesList = [
    'ui.router',
    'ui.bootstrap',
    'angular-growl',
    'myApp.controllers',
    'myApp.directives',
    'myApp.services',
    'myApp.filters',
    'myApp.resources'
];

var socket = io.connect(myAppGlobals.baseUrl);

// configure the resources list into myApp.resources
var myAppResource = function($resource) {
    return $resource('/', {}, myAppGlobals.resourceList)
}
angular.module('myApp.resources').factory('myAppResource', ['$resource', myAppResource]);

// main angular module
angular.module('myApp', modulesList)
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        _.each(myAppGlobals.states, function(state) {
            $stateProvider.state(state)
        });
        // default route
        $urlRouterProvider.otherwise(myAppGlobals.defaultState);
    }])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X.Requested-With'];
        $httpProvider.interceptors.push('interceptorService');
    }]).config(['$locationProvider', function($locationProvider) {
        /*$locationProvider.html5Mode({
            enabled: true,
            requireBase: true
        })*/
    }])
    .run(['$rootScope', '$location', '$window', '$state', 'logService', 'utilsService', function($rootScope, $location, $window, $state, logService, utilsService) {
        // copy the routes list to rootScope (only the route and not other info

        // copy the constraints to the rootScope
        $rootScope.constraints = {};
        _.each(myAppGlobals.resourceList, function(value, key) {
            $rootScope.constraints[key] = value['constraints'];
        });

        // set the base url
        $rootScope.baseUrl = myAppGlobals.baseUrl;
        $rootScope.version = myAppGlobals.version;
        $rootScope.severErrorOccurred = false;
        $rootScope.displaySeverErrorMessage = false;
        $rootScope.clientDebug = myAppGlobals.clientDebug;
        $rootScope.appConfigs = myAppGlobals.appConfigs;
        $rootScope.loggedInRole = [];
        // set the rootScope for variables
        // console.log(myAppGlobals)
        if (myAppGlobals.loggedIn === true) {
            $rootScope.loggedIn = true;
            $rootScope.account = myAppGlobals.account;
            $rootScope.loggedInRole = myAppGlobals.roleList[myAppGlobals.account.role]
            socket.on('connect', function(data) {
                socket.emit('storeClientInfo', {
                    userId: myAppGlobals.account._id
                });
            });
            if (myAppGlobals.account.role == "admin") {
                socket.on('userInfo', function(data) {
                    $rootScope.$broadcast('onlineuser-updated', data);
                });
            }
        } else {
            $rootScope.loggedIn = false;
        }

        // global modal instance
        $rootScope.modalInstances = {}
        $rootScope.openModal = function(modalConfig) {
            $rootScope.modalInstances[modalConfig.modalName] = utilsService.openModal(modalConfig)
        }
        $rootScope.closeModal = function(modalName) {
            if ($rootScope.modalInstances[modalName]) {
                utilsService.closeModal($rootScope.modalInstances[modalName])
                return true
            } else {
                return false
            }
        }

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            // event.preventDefault();
            
            // store the previous state
            $rootScope.previousState = {
                state: fromState,
                params: fromParams
            };
        });



        //*** Manages redirection after sign in ******
        // **** for links in email ****
        // if the user is requesting a path that requires a login, but is not logged in, save that path in the cookie
        // the user will then be redirected after login
        if ($rootScope.loggedIn === false) {
            var isValidRoute = false
            var routeFirstPath = $location.path().split('/')[1];
            if ($location.path()) {
                _.each($rootScope.routesList, function(item) {
                    if (routeFirstPath == item.split('/')[1]) {
                        isValidRoute = true
                    }
                });
                /*if (!isValidRoute) {
                    // set the cookie with the value
                    utilsService.setCookie('pathHistory.lastRequestedPath', $location.path());
                    utilsService.setCookie('pathHistory.landingPageView', 'signin');
                }*/
            }
        } else {
            /*var lastRequestedPath = utilsService.getCookie('pathHistory.lastRequestedPath');
            if (lastRequestedPath) {
                utilsService.removeCookie('pathHistory.lastRequestedPath');
                $location.path(lastRequestedPath).replace();
            }*/
        }

        // initiate the handling for exception
        $rootScope.$on('event::exception-occurred', function(event, response) {
            $rootScope.displaySeverErrorMessage = true;
            if ($rootScope.severErrorOccurred === false) {
                logService.makeLog({
                    makeLog: {
                        log: response
                    }
                }, function(err, response) {
                    $rootScope.severErrorOccurred = true;
                });
            }
            $rootScope.severErrorOccurred = true;
        });

        $rootScope.goTo = function(state, params) {
            $state.go(state, params, {
                notify: true,
                location: true,
                reload: true
            })
        };

        // this is to reload the landing page (full reload) to handle the bug with fb login
        $rootScope.reloadLanding = function(mode) {
            // utilsService.setCookie('pathHistory.landingPageView', mode);
            $window.location = '/'
        };

        $rootScope.validatePassword = function(pwd) {
            return utilsService.validatePassword(pwd)
        };

        $rootScope.checkRole = function(x){
            return _.contains($rootScope.loggedInRole, x.toLowerCase())
        }

        $rootScope.constraint = {
            password: {
                presence: true,
                format: {
                    pattern: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/,
                    message: "must conatins uppercase, lowercase, number and special characters"
                },
                length: {
                    minimum: 8,
                    message: "must contain 8 characters"
                }
            }
        };
        $rootScope.validate = validate;
    }]);
// all account related services
var accountService = function(myAppResource, utilsService) {
    return {
        signIn: function(params, cb) {
            var msg = utilsService.validateInput('signIn', params);
            if (msg.length == 0) {
                var prm = myAppResource.signIn({
                    signIn: params
                });
                prm.$promise.then(utilsService.successCallBack(cb), utilsService.errorCallBack(cb));
            } else {
                cb(msg, null)
            }
        },
        updateUser: function(params, cb) {
            var msg = utilsService.validateInput('updateUser', params);
            if (msg.length == 0) {
                var prm = myAppResource.updateUser({
                    updateUser: params
                });
                prm.$promise.then(utilsService.successCallBack(cb), utilsService.errorCallBack(cb));
            } else {
                cb(msg, null)
            }
        },
        signUp: function(params, cb) {
            var msg = utilsService.validateInput('signUp', params);
            if (msg.length == 0) {
                var prm = myAppResource.signUp({
                    signUp: params
                });
                prm.$promise.then(utilsService.successCallBack(cb), utilsService.errorCallBack(cb));
            } else {
                cb(msg, null)
            }
        },
        getUserList: function(params, cb) {
            var msg = utilsService.validateInput('getUserList', params);
            if (msg.length == 0) {
                var prm = myAppResource.getUserList({
                    getUserList: params
                });
                prm.$promise.then(utilsService.successCallBack(cb), utilsService.errorCallBack(cb));
            } else {
                cb(msg, null)
            }
        },
        logout: function(cb) {
            var prm = myAppResource.logout();
            prm.$promise.then(utilsService.successCallBack(cb), utilsService.errorCallBack(cb));
        },
        validateEmail: function(email) {
            var params = {
                email: email
            }
            var prm = myAppResource.validateEmail(params)
            return prm
        },
        validateUserName: function(userName) {
            var params = {
                userName: userName
            }
            var prm = myAppResource.validateUserName(params)
            return prm
        }
    }
}
angular.module('myApp.services').factory('accountService', ['myAppResource', 'utilsService', accountService]);
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
angular.module('myApp.directives').directive('emailValidator', function($q,accountService) {
    return {
        require: 'ngModel',
        restrict : 'EA',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$asyncValidators.emailValidator = function(modelValue, viewValue) {
                var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
                if (viewValue && EMAIL_REGEXP.test(viewValue.toLowerCase())) {
                    var prm = accountService.validateEmail(viewValue.toLowerCase())
                    var defer = $q.defer();
                    prm.$promise.then(function(results) {
                        if (results.validEmail) { // no account with this email address
                            defer.resolve();
                        } else {
                            defer.reject()
                        }
                    },function(err){
                        return $q.reject(err)
                    });
                    return defer.promise
                } else {
                    return $q.when()
                }
            };
        }
    };
});

angular.module('myApp.directives').directive('passwordValidator', function() {
    return {
        require: 'ngModel',
        restrict: 'EA',
        link: function(scope, element, attrs, ngModel) {
            // debugger;
            ngModel.$asyncValidators.passwordValidator = function(modelValue, viewValue) {
                console.log(modelValue)
                console.log(viewValue)
                var REGEXP_SPECIAL = /[!@#$%^&*?_~]/;
                var REGEXP_LOWER_CASE = /[a-z]/;
                var REGEXP_UPPER_CASE = /[A-Z]/;
                var REGEXP_NUMBER = /[0-9]/;
                if (viewValue && viewValue.length > 7 && REGEXP_SPECIAL.test(viewValue) && REGEXP_LOWER_CASE.test(viewValue) && REGEXP_UPPER_CASE.test(viewValue) && REGEXP_NUMBER.test(viewValue)) {
                    return true
                } else {
                    return false
                }
            };
        }
    };
});
angular.module('myApp.directives').directive('usernameValidator', function($q,accountService) {
    return {
        require: 'ngModel',
        restrict : 'EA',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$asyncValidators.usernameValidator = function(modelValue, viewValue) {
                if (viewValue && viewValue.length > 4) {
                    var prm = accountService.validateUserName(viewValue.toLowerCase())
                    var defer = $q.defer();
                    prm.$promise.then(function(results) {
                        if (results.validUserName) { // no account with this username
                            defer.resolve();
                        } else {
                            defer.reject()
                        }
                    },function(err){
                        return $q.reject(err)
                    });
                    return defer.promise
                } else {
                    return $q.when()
                }
            };
        }
    };
});

angular.module('myApp.filters')
    .filter('titleCase', function() {
        return function(input) {
            if (input == null) {
                return null
            } else if (input !== undefined) {
                input = input || ''
                return input.replace(/\w\S*/g, function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                })
            } else {
                return null
            }
        }
    }).filter('removeUnderSocre', function() {
        return function(input) {
            if (input == null) {
                return null
            } else if (input !== undefined) {
                input = input.replace("_", " ")
                input = input || ''
                return input.replace(/\w\S*/g, function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                })
            } else {
                return null
            }
        }
    }).filter('dob', function() {
        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return function(input) {
            if (input == null) {
                return null
            } else if (input !== undefined) {
                var d = new Date(input);
                return monthNames[d.getMonth()] + ", " + d.getDate()
            } else {
                return null
            }
        }
    })
var headerController = function($scope, $rootScope, $stateParams, $window, utilsService, accountService) {
    $scope.userProfile = $rootScope.account;

    $scope.handleLogout = function(){
    	accountService.logout(function(error, validationError, result){
    		$window.location = '/';
    	})
    }

};
angular.module('myApp.controllers').controller('headerController', ['$scope', '$rootScope', '$stateParams', '$window', 'utilsService', 'accountService', headerController]);
var landingController = function($scope, $rootScope, $stateParams, $window, growl, utilsService, accountService) {
    if ($rootScope.loggedIn === true) {
        $window.location = '/'
    }
    $scope.user = {};
    $scope.handleSignInForm = function(data) {
        var params = data;
        accountService.signIn(params, function(error, validationError, result) {
            if (error) {
                if (error.status == 404) {
                    growl.error('Invalid email or password', {
                        ttl: 5000
                    })
                } else {
                    utilsService.logger('error', error);
                }
            } else if (validationError) {
                utilsService.logger('error', validationError);
            } else {
                if (result && result.data) {
                    $window.location = '/';
                }
            }
        })
    }
};
angular.module('myApp.controllers').controller('landingController', ['$scope', '$rootScope', '$stateParams', '$window', 'growl', 'utilsService', 'accountService', landingController]);
var profileController = function($scope, $rootScope, $stateParams, $window, utilsService, accountService, growl) {
    if ($rootScope.loggedIn === false || ($rootScope.account && $rootScope.account.role != "admin")) {
        $window.location = '/'
    }
    $scope.userList = [];

    $rootScope.handleUserModal = function(data, mode) {
        $scope.activeUserViewData = angular.copy(data);
        $scope.activeUserEditData = angular.copy(data);
        $scope.modalUserConfig = {
            modalName: 'userModal',
            animation: true,
            templateUrl: 'dist/views/modal/userModal',
            size: 'md',
            backdrop: 'static',
            mode: mode,
            scope: $scope,
            controller: function() {}
        }
        $rootScope.openModal($scope.modalUserConfig);
    }

    $scope.handleSignUpForm = function(data){
        var params = angular.copy(data);
        delete params.cnfPassword;
        console.log(params)
        accountService.signUp(params, function(error, validationError, result) {
            if (error) {
                if (error.status == 404) {
                    growl.error(error, {
                        ttl: 5000
                    })
                } else {
                    utilsService.logger('error', error);
                }
            } else if (validationError) {
                utilsService.logger('error', validationError);
            } else {
                if (result && result.data) {
                    $scope.userList.push(result.data)
                    $rootScope.closeModal('userModal');
                    growl.success('User registered successfully', {
                        ttl: 5000
                    })
                }
            }
        })
    }

    $scope.updateUser = function(data) {
        var params = data;
        params.adminId = $rootScope.account._id;
        accountService.updateUser(params, function(error, validationError, result) {
            if (error) {
                if (error.status == 404) {
                    growl.error(error, {
                        ttl: 5000
                    })
                } else {
                    utilsService.logger('error', error);
                }
            } else if (validationError) {
                utilsService.logger('error', validationError);
            } else {
                if (result && result.data) {
                    _.each($scope.userList, function(item, index){
                        if(result.data._id == item._id){
                            $scope.userList[index] = result.data;
                        }
                    })
                    $rootScope.closeModal('userModal');
                    growl.success('User profile updated successfully', {
                        ttl: 5000
                    })
                }
            }
        })
    }

    accountService.getUserList({
        _id: $rootScope.account._id
    }, function(error, validationError, result) {
        if (error) {
            if (error.status == 404) {
                $scope.userMessage = 'Invalid User';
            } else {
                utilsService.logger('error', error);
            }
        } else if (validationError) {
            utilsService.logger('error', validationError);
        } else {
            if (result && result.data) {
                $scope.userList = result.data;
            }
        }
    })

    $rootScope.$on('onlineuser-updated', function(event, val) {
        var tempActiveUser = []
        _.each($scope.userList, function(item, index) {
            _.each(val, function(item1, index1) {
                if (item._id === item1.userId) {
                    tempActiveUser.push(item)
                }
            })
        })

        $scope.$apply(function() {
            $scope.onlineUser = tempActiveUser;
        });
    });
};
angular.module('myApp.controllers').controller('profileController', ['$scope', '$rootScope', '$stateParams', '$window', 'utilsService', 'accountService', 'growl', profileController]);
var signUpController = function($scope, $rootScope, $stateParams, $window, growl, utilsService, accountService) {
    if ($rootScope.loggedIn === true) {
        $window.location = '/'
    }

    $scope.handleSignUpForm = function(data){
    	var params = angular.copy(data);
    	delete params.cnfPassword;
        accountService.signUp(params, function(error, validationError, result) {
            if (error) {
                if (error.status == 404) {
                    growl.error(error, {
                        ttl: 5000
                    })
                } else {
                    utilsService.logger('error', error);
                }
            } else if (validationError) {
                utilsService.logger('error', validationError);
            } else {
                if (result && result.data) {
                    growl.success('User registered successfully', {
                        ttl: 5000
                    })
                    $window.location = '/';
                }
            }
        })
    }
};
angular.module('myApp.controllers').controller('signUpController', ['$scope', '$rootScope', '$stateParams', '$window', 'growl', 'utilsService', 'accountService', signUpController]);

var userController = function($scope, $rootScope, $stateParams, $window, utilsService, accountService, growl) {
    if ($rootScope.loggedIn === false || $rootScope.account.role == "admin") {
        $window.location = '/'
    }
    $scope.userProfile = $rootScope.account;

    $scope.handleUserModal = function(data, mode){
    	$scope.activeUserViewData = angular.copy(data);
    	$scope.activeUserEditData = angular.copy(data);
    	$scope.modalUserConfig = {
    		modalName: 'userModal',
    		animation: true,
    		templateUrl: 'dist/views/modal/userModal',
    		size: 'md',
    		backdrop: 'static',
    		mode: mode,
            scope: $scope,
            controller: function () { }
    	}
    	$rootScope.openModal($scope.modalUserConfig);
    }

    $scope.updateUser = function(data){
        var params = data;
        accountService.updateUser(params, function(error, validationError, result) {
            if (error) {
                if (error.status == 404) {
                    growl.error(error, {
                        ttl: 5000
                    })
                } else {
                    utilsService.logger('error', error);
                }
            } else if (validationError) {
                utilsService.logger('error', validationError);
            } else {
                if (result && result.data) {
                    $rootScope.closeModal('userModal');
                    $rootScope.account = result.data;
                    $scope.userProfile = $rootScope.account;
                    growl.success('User profile updated successfully', {
                        ttl: 5000
                    })
                }
            }
        })
    }

};
angular.module('myApp.controllers').controller('userController', ['$scope', '$rootScope', '$stateParams', '$window', 'utilsService', 'accountService', 'growl', userController]);