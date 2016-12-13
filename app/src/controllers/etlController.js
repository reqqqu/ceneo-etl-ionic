'use strict';

/**
 * @ngdoc function
 * @name CeneoETL.controller:EtlController
 * @description
 * # EtlController
 */
module.exports = [
    '$scope',
    '$sce',
    'HTTPService',
    'EtlService',

    function($scope, $sce, HTTPService, EtlService) {

    	$scope.hasExtractFinished = false;
    	$scope.hasTransformFinished = false;
    	$scope.search = {
    		"searchKeywords": ""
    	};

    	$scope.isProductNumberValid = function () {
    	    return $scope.search.searchKeywords.length < 8 || typeof $scope.search.searchKeywords !== 'string' || isNaN($scope.search.searchKeywords);
        };


        $scope.extract = function() {
              var productId = $scope.search.searchKeywords;
              // var requestLoop = true;

              // if(requestLoop === true) {
              //
              // }

              HTTPService.makeRequest($scope.search.searchKeywords, 0, null).then(function (response) {
                  var rawData = response.data;

                  // if(thereisresponse) {
                    // set the request flag to false
                    // requestLoop = false;
                  // }

                  HTTPService.parseResponse(rawData, productId);
              },
              function (error) {
                  console.log('error');
              });


              return $scope.data;
        };

      $scope.etl = function() {

      }
    }
];
