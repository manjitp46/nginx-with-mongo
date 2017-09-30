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
