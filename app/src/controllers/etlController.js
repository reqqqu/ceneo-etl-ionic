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
              HTTPService.makeRequest($scope.search.searchKeywords, 0, null).then(function (response) {
                  //console.log(response.data);
                  $scope.data = response.data;
                  var htmlElement = angular.element($scope.data);
                  var reviewsContainer = htmlElement.find('ol');

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
