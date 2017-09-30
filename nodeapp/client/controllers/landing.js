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