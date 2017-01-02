'use strict';

/**
 * @ngdoc factory
 * @name ReviewFactory
 * @description
 * #ReviewFactory
 * Contains Review object model and basic method for creating Review object
 */
module.exports = [

  function () {

    var reviewModel = {
      disadvantages: [],
      advantages: [],
      summary: '',
      starsCount: 0,
      author: '',
      submissionDate: null,
      recommendsProduct: false,
      ratedUsefulCount: 0,
      ratedUselessCount: 0,
      id: ''
    };

      /**
       * Constructor, with class name
       */
      function Review() {
        return angular.copy(reviewModel);
      }

      /**
       * Return the constructor function
       */
      return Review;
    }
];