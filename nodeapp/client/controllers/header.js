var headerController = function($scope, $rootScope, $stateParams, $window, utilsService, accountService) {
    $scope.userProfile = $rootScope.account;

    $scope.handleLogout = function(){
    	accountService.logout(function(error, validationError, result){
    		$window.location = '/';
    	})
    }

};
angular.module('myApp.controllers').controller('headerController', ['$scope', '$rootScope', '$stateParams', '$window', 'utilsService', 'accountService', headerController]);