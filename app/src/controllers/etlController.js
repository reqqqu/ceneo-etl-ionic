'use strict';

/**
 * @ngdoc function
 * @name CeneoETL.controller:EtlController
 * @description
 * # EtlController
 * Controller for main app view (ETL)
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

      /**
       * Resets productId
       * @private
       */
      function _resetProductId() {
        $scope.search = {
          "productId": ""
        };
      }

      /**
       * Resets controller flags and scope variables
       * @private
       */
    	function _resetFlags() {
        $scope.numberOfRequestsMade = 0;
        $scope.numberOfReviewsAddedToDatabase = 0;
        $scope.productExistsInDatabase = false;
        $scope.etlInProgress = false;

        $scope.hasExtractFinished = false;
        $scope.hasTransformFinished = false;
        $scope.hasLoadingFinished = false;
      }

      function _init() {
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
      }

      /**
       * Checks if input given by user can be valid number of product
       * @returns {boolean}
       */
    	$scope.isProductNumberValid = function () {
    	    return $scope.search.productId.length < 8 || typeof $scope.search.productId !== 'string' || isNaN($scope.search.productId);
        };


      /**
       * View method for data extraction
       * @returns {*|Promise.<TResult>}
       */
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

      /**
       * View method for data transformation
       * @returns {*|Promise.<TResult>}
       */
      $scope.transform = function() {
        $scope.etlInProgress = true;
        return EtlService.transformData().then(function (productExistsInDB) {
          $scope.hasTransformFinished = true;
          $scope.productExistsInDatabase = productExistsInDB;
          $scope.etlInProgress = false;
        });
      };

      /**
       * View method for data loading
       * @returns {*|Promise.<TResult>}
       */
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

      /**
       * View method for making complete ETL process
       * @returns {*}
       */
      $scope.etl = function() {
        var productId = $scope.search.productId;

        return $scope.extract(productId).then(function () {
          $scope.transform().then(function () {
            $scope.load()
          });
        });
      };

      /**
       * View method for clearing all reviews of given product
       * @returns {*}
       */
      $scope.clearReviews = function () {
        _resetFlags();
        return DBService.removeReviewsFromProduct($scope.search.productId);
      };


      /**
       * View method for saving all reviews to CSV file
       * @returns {*}
       */
      $scope.saveToCSV = function() {
        return CSVService.saveProductReviewsToCSV($scope.search.productId);
      }

      /**
       * Method for redirecting user to reviews view
       */
      $scope.viewReviews = function() {
        return $state.go('reviews', { productId: $scope.search.productId });
      };


      _init();
    }
];
