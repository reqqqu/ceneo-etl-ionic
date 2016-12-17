'use strict';

/**
 * @ngdoc function
 * @name CeneoETL.service:ExampleService
 * @description
 * # ExampleService
 */
module.exports = [
    '$http',
    'ReviewFactory',
    'ProductFactory',

    function($http, ReviewFactory, ProductFactory) {
        var makeRequest = function(url, requestIndex, params) {
            var customUrl = "";
            var ceneoUrl = "http://www.ceneo.pl/";
            var prefix = [
                window.location.origin,
                window.location.pathname,
                "proxy?url="
            ].join("");
            var params = "";

            // if(requestIndex > 1) {
            //  params = ""; // set review page params etc.
            // }

            console.log(typeof url);
            customUrl = [
                prefix,
                ceneoUrl,
                url,
                params
            ].join("");


            return $http({
                method: 'GET',
                url: customUrl
            }).success(function(res) {
                console.log('Successfully got ETL server data.');
                return res;
            }).error(function(err) {
                console.log('An error occured while getting ETL server data.', err);
                return null;
            });
        };

        var parseResponse = function(data, productId) {
          var _data = data;
          var parser = new DOMParser();
          var doc = parser.parseFromString(_data, 'text/html');

          /*
           * getting product containers/reviews
           */
          var _productId = productId; // @rk: this will be used as well when iteration through review pages is implemented
          var product = new ProductFactory();
          var productString ='';

          product.id = productId;

          /*
           * getting review containers/reviews
           */
          var reviewsContainer = angular.element(doc.querySelector('.product-reviews'));
          var reviews = reviewsContainer[0].querySelectorAll('li.product-review');
          var reviewDataArray = [];


          for(var i=0; i<reviews.length; i++) {
            var review              = new ReviewFactory();


            var disadvantagesNodes = reviews[i].querySelectorAll('.pros-cell ul li');
            if(disadvantagesNodes.length > 0) {
                for(var x=0; x<disadvantagesNodes.length; x++) {
                  review.disadvantages.push(disadvantagesNodes[x].innerHTML);
                }
            }
            disadvantagesNodes = [];

            var advantagesNodes = reviews[i].querySelectorAll('.cons-cell ul li');
            if(advantagesNodes.length > 0) {
              for(var x=0; x<advantagesNodes.length; x++) {
                review.advantages.push(advantagesNodes[x].innerHTML);
              }
            }
            advantagesNodes = [];

            review.summary           = reviews[i].querySelector('.product-review-body').innerHTML;
            review.starsCount        = reviews[i].querySelector('.review-score-count').innerHTML;
            if(review.starsCount) {
              review.starsCount = review.starsCount.replace(/\/\d*/, "");
            }
            review.author            = reviews[i].querySelector('.product-reviewer').innerHTML;
            review.submissionDate    = reviews[i].querySelector('time').getAttribute('datetime');
            review.recommendsProduct = reviews[i].querySelector('.product-review-summary');
            if(review.recommendsProduct) {
              review.recommendsProduct = review.recommendsProduct.querySelector("em").innerHTML;
            }
            review.ratedUsefulCount = reviews[i].querySelector(".vote-yes").getAttribute("data-vote");
            review.ratedUselessCount = reviews[i].querySelector(".vote-no").getAttribute("data-vote");
            review.id                = new Date(review.submissionDate).getTime();

            reviewDataArray.push(review);
          }

          console.log(reviewDataArray);

          // saving review data to product object
          product.reviews = reviewDataArray;

          // returns stringified JSON
          return product;
        };


        return {
            makeRequest: makeRequest,
            parseResponse: parseResponse
        };
    }
];
