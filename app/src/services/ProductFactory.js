'use strict';
module.exports = [
  'DBService',

  function (DBService) {

    var productModel = {
      id: '',
      category: '',
      brand: '',
      model: '',
      additionalFeatures: [],
      reviews: []
    };

    /**
     * Constructor, with class name
     * disadventages, adventages, summary, starsCount, author, date, recommendsProduct, ratedUsefulCount, reviewRatedUnuseful
     */
    function Product(properties) {
      return angular.copy(productModel);
    }

    function addReviews(product, reviewsToAdd) {
      let uniqueReviews = [];
      for (var key in reviewsToAdd) {
        if( !hasReview(product, reviewsToAdd[key].id)) {
          uniqueReviews.push(reviewsToAdd[key]);
        }
      }

      if(uniqueReviews.length > 0) {
        _addReviewsToProduct(product, uniqueReviews);
      }
    }

    function hasReview(product, reviewId) {
      return product.reviews.some(function (review) {
        return review.id === reviewId
      });
    }

    function _addReviewsToProduct(product, reviews) {
      product.reviews = product.reviews.concat(reviews);
      DBService.updateProduct(product);
    }

    /**
     * Return the constructor function
     */
    return {
      Product: Product,
      hasReview: hasReview
    };
  }
];/**
 * Created by Sylwia on 2016-12-13.
 */
