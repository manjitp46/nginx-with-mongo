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
