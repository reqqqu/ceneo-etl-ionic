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

      function _resetProductId() {
        $scope.search = {
          "productId": ""
        };
      }

    	function _resetFlags() {
        $scope.numberOfRequestsMade = 0;
        $scope.numberOfReviewsAddedToDatabase = 0;
        $scope.productExistsInDatabase = false;
        $scope.etlInProgress = false;

        $scope.hasExtractFinished = false;
        $scope.hasTransformFinished = false;
        $scope.hasLoadingFinished = false;
      }

      _resetFlags();
      _resetProductId();


      $scope.$on('$stateChangeSuccess', function() {
        _resetFlags();
        _resetProductId();
      });

      $ionicPlatform.ready(function() {
        // Initialize the database.
        DBService.initDB();
      });

    	$scope.isProductNumberValid = function () {
    	    return $scope.search.productId.length < 8 || typeof $scope.search.productId !== 'string' || isNaN($scope.search.productId);
        };


      $scope.extract = function() {
        _resetFlags();

            var productId = $scope.search.productId;
            $scope.etlInProgress = true;
            return EtlService.extractData(productId).then(function (numberOfRequestsMade) {
              $scope.hasExtractFinished = true;
              $scope.hasTransformFinished = false;
              $scope.hasLoadingFinished = false;
              $scope.etlInProgress = false;

              $scope.numberOfRequestsMade = numberOfRequestsMade; // @todo change
            });
      };

      $scope.transform = function() {
        $scope.etlInProgress = true;
        return EtlService.transformData().then(function (productExistsInDB) {
          $scope.hasTransformFinished = true;
          $scope.productExistsInDatabase = productExistsInDB;
          $scope.etlInProgress = false;
        });
      };

      $scope.load = function () {
        $scope.etlInProgress = true;
        
        return EtlService.loadData().then(function (numberOfReviewsAdded) {
          $scope.hasTransformFinished = false;
          $scope.hasExtractFinished = false;
          $scope.hasLoadingFinished = true;
          $scope.etlInProgress = false;

          $scope.numberOfReviewsAddedToDatabase = numberOfReviewsAdded;
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
        //_resetFlags();
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
