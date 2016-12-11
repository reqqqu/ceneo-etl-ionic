'use strict';

/**
 * @ngdoc function
 * @name CeneoETL.controller:EtlController
 * @description
 * # EtlController
 */
module.exports = [
    '$scope',
    'UtilService',
    'EtlService',

    function($scope, UtilService, EtlService) {
    	$scope.hasExtractFinished = false;
    	$scope.hasTransformFinished = false;
    	$scope.search = {
    		"searchKeywords": ""
    	};

      $scope.extract = function() {
      	$scope.data = UtilService.makeRequest($scope.search.searchKeywords, 0, null);
      }

      $scope.etl = function() {

      }
    }
];
