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