'use strict';
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
      function Review(data) {
        return angular.copy(reviewModel);
      }

      /**
       * Return the constructor function
       */
      return Review;
    }
];