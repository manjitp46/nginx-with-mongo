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