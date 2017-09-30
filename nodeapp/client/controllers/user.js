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