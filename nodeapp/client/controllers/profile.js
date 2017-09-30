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