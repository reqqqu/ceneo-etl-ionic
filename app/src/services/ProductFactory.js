'use strict';

/**
 * @ngdoc factory
 * @name ProductFactory
 * @description
 * #ProductFactory
 * Contains basic method for creating and acessing Product object
 */
module.exports = [

  function () {

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

    function hasReview(product, reviewId) {
      return product.reviews.some(function (review) {
        return review.id === reviewId
      });
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
