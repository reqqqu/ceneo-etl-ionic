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
      this.data = productModel;
    }

    function addReview(review) {
      this.productModel.reviews.add(review);
    }

    function hasReview(reviewId) {
      return this.productModel.reviews.any(function (review) {
        return review.id === reviewId;
      });
    }

    function getAllReviews() {
      return this.productModel.reviews;
    }
    /**
     * Return the constructor function
     */
    return Product;
  }
];/**
 * Created by Sylwia on 2016-12-13.
 */
