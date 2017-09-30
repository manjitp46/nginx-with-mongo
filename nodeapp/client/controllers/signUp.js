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
