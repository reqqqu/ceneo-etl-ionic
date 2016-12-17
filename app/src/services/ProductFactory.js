'use strict';
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

    function addReview(review) {

    }

    function hasReview(reviewId) {

    }

    function getAllReviews() {

    }
    /**
     * Return the constructor function
     */
    return Product;
  }
];/**
 * Created by Sylwia on 2016-12-13.
 */
