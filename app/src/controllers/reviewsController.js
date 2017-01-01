'use strict';

/**
 * @ngdoc function
 * @name CeneoETL.controller:ReviewsController
 * @description
 * # ReviewsController
 */
module.exports = [
    '$scope',
    '$stateParams',
    '$ionicHistory',
    'DBService',

    function($scope, $stateParams, $ionicHistory, DBService) {
      $scope.productDetails = {};
      $scope.noMoreItems = false;
      $scope.reviews = [];
      var productId = $stateParams.productId;
      var productData = [];
      var hasDataLoaded = false;

      function init() {
        DBService.getProductWithId(productId).then(function(data) {
          hasDataLoaded = true;
          productData = data;

          $scope.productDetails = {
            brand: productData.brand,
            model: productData.model,
            id: productData.id
          };
        });
      }

      $scope.goBack = function(){
        $ionicHistory.goBack();
      };

      $scope.loadMoreItems = function() {
        var reviewsSize = $scope.reviews.length;
        var xhrReviewsSize = productData.reviews.length;

        $scope.reviews.push(productData.reviews[reviewsSize]);

        if(reviewsSize === xhrReviewsSize-1) {
          $scope.noMoreItems = true;
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      };

      $scope.$on('$stateChangeSuccess', function() {
        if(hasDataLoaded) {
          $scope.loadMoreItems();
        }
      });

      $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
        viewData.enableBack = true;
      });

      // @TODO: implement single review save to CSV
      $scope.saveReview = function() {};

      init();
    }
];
