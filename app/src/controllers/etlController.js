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
    '$ionicPlatform',
    'EtlService',
    'DBService',

    function($scope, $sce, $ionicPlatform, EtlService, DBService) {

    	$scope.hasExtractFinished = false;
    	$scope.hasTransformFinished = false;
    	$scope.search = {
    		"searchKeywords": ""
    	};



      $ionicPlatform.ready(function() {
        // Initialize the database.
        DBService.initDB();
      });

    	$scope.isProductNumberValid = function () {
    	    return $scope.search.searchKeywords.length < 8 || typeof $scope.search.searchKeywords !== 'string' || isNaN($scope.search.searchKeywords);
        };


      $scope.extract = function() {
            var productId = $scope.search.searchKeywords;

            EtlService.extractData(productId).then(function () {
              $scope.hasExtractFinished = true;
            });

            return $scope.data;
      };

      $scope.transform = function() {
        return EtlService.transformData().then(function () {
          $scope.hasTransformFinished = true;
        });
      };

      $scope.etl = function() {
        var productId = $scope.search.searchKeywords;

        return EtlService.extractData(productId).then(function () {
          $scope.hasExtractFinished = true;
          return EtlService.transformData().then(function () {
            $scope.hasTransformFinished = true;
          });
        });
      }
    }
];
