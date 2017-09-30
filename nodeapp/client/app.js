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