'use strict';

/**
 * @ngdoc function
 * @name CeneoETL.service:ExampleService
 * @description
 * # ExampleService
 */
module.exports = [
    '$http',

    function($http) {
        var makeRequest = function(url, requestIndex, params) {
            var customUrl = "";
            var ceneoUrl = "http://www.ceneo.pl/";
            var prefix = [
                window.location.origin,
                window.location.pathname,
                "proxy?url="
            ].join("");

            console.log(typeof url);
            customUrl = [
                prefix,
                ceneoUrl,
                url,
                "/opinie-" + requestIndex + ";0160-1"
            ].join("");


            return $http({
                method: 'GET',
                url: customUrl
            }).success(function(res) {
                console.log('Successfully got ETL server data.', res.status);
                return res;
            }).error(function(err) {
                console.log('An error occurred while getting ETL server data.', err);
                return null;
            });
        };


        return {
            makeRequest: makeRequest
        };
    }
];
