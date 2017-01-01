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
    '$state',
    '$ionicPlatform',
    'EtlService',
    'DBService',
    'CSVService',


    function($scope, $sce, $state, $ionicPlatform, EtlService, DBService, CSVService) {

      $scope.numberOfRequestsMade = 0;
      $scope.numberOfReviewsAddedToDatabase = 0;
      $scope.productExistsInDatabase = false;

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

            return EtlService.extractData(productId).then(function () {
              $scope.hasExtractFinished = true;
              $scope.hasTransformFinished = false;

              $scope.numberOfRequestsMade = 1; // @todo change
            });
      };

      $scope.transform = function() {
        return EtlService.transformData().then(function (productExistsInDB) {
          $scope.hasTransformFinished = true;
          $scope.productExistsInDatabase = productExistsInDB;
        });
      };

      $scope.load = function () {
        return EtlService.loadData().then(function (numberOfReviewsAdded) {
          $scope.hasTransformFinished = false;
          $scope.hasExtractFinished = false;
          $scope.hasLoadingFinished = true;

          $scope.numberOfReviewsFromRequest = numberOfReviewsAdded;
        });
      };

      $scope.etl = function() {
        var productId = $scope.search.productId;

        return $scope.extract(productId).then(function () {
          $scope.transform().then(function () {
            $scope.load()
          });
        });
      };

      $scope.clearReviews = function () {
        return DBService.removeReviewsFromProduct($scope.search.productId);
      };


      $scope.saveToCSV = function() {
        return CSVService.saveProductReviewsToCSV($scope.search.productId);
      }

      $scope.viewReviews = function() {
        $state.go('reviews', { productId: $scope.search.productId });
      };
    }
];
