angular.module('myApp.filters')
    .filter('titleCase', function() {
        return function(input) {
            if (input == null) {
                return null
            } else if (input !== undefined) {
                input = input || ''
                return input.replace(/\w\S*/g, function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                })
            } else {
                return null
            }
        }
    }).filter('removeUnderSocre', function() {
        return function(input) {
            if (input == null) {
                return null
            } else if (input !== undefined) {
                input = input.replace("_", " ")
                input = input || ''
                return input.replace(/\w\S*/g, function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                })
            } else {
                return null
            }
        }
    }).filter('dob', function() {
        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return function(input) {
            if (input == null) {
                return null
            } else if (input !== undefined) {
                var d = new Date(input);
                return monthNames[d.getMonth()] + ", " + d.getDate()
            } else {
                return null
            }
        }
    })