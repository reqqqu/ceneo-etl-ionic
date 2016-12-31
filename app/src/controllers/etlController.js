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
    	$scope.hasLoadingFinished = false;
    	$scope.search = {
    		"productId": ""
    	};



      $ionicPlatform.ready(function() {
        // Initialize the database.
        DBService.initDB();
      });

    	$scope.isProductNumberValid = function () {
    	    return $scope.search.productId.length < 8 || typeof $scope.search.productId !== 'string' || isNaN($scope.search.productId);
        };


      $scope.extract = function() {
            var productId = $scope.search.productId;

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

      $scope.load = function () {
        return EtlService.loadData().then(function () {
          $scope.hasTransformFinished = false;
          $scope.hasExtractFinished = false;
          $scope.hasLoadingFinished = true;
        });
      };

      $scope.etl = function() {
        var productId = $scope.search.productId;

        return EtlService.extractData(productId).then(function () {
          $scope.hasExtractFinished = true;
          return EtlService.transformData().then(function () {
            $scope.hasTransformFinished = true;
          });
        });
      }

      $scope.clearReviews = function () {
        return DBService.removeReviewsFromProduct($scope.search.productId);
      }

      $scope.save = function() {
        return DBService.getReviewsFromProduct($scope.search.productId);
      }
    }
];
