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
        var makeRequest = function(url, requestType, params) {
            var customUrl = "";
            var ceneoUrl = "http://www.ceneo.pl/";
            var prefix = [
                window.location.origin,
                window.location.pathname,
                "proxy?url="
            ].join("");

            console.log(typeof url);
            customUrl = [
                prefix,
                ceneoUrl,
                url,
                "/opinie-1;0160-1"
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

        var parseResponse = function(data, responseIndex, productId) {
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
          var reviewsContainer = angular.element(doc.querySelector('.review-box-items-list'));
          var reviews = reviewsContainer[0].getElementsByClassName('review-box-item');
          var reviewDataArray = [];


          for(var i=0; i<reviews.length; i++) {
            var review              = new ReviewFactory();


            var disadvantagesNodes = reviews[i].querySelectorAll('.product-pros-cons .red-text + .no-margin--top.no-margin--bottom.grey-text.text-darken-2.m-font-14 li');
            if(disadvantagesNodes.length > 0) {
                for(var x=0; x<disadvantagesNodes.length; x++) {
                  review.data.disadvantages.push(disadvantagesNodes[x].innerHTML);
                }
            }
            disadvantagesNodes = [];

            var advantagesNodes = reviews[i].querySelectorAll('.product-pros-cons .green-text + .no-margin--top.no-margin--bottom.grey-text.text-darken-2.m-font-14 li');
            if(advantagesNodes.length > 0) {
              for(var x=0; x<advantagesNodes.length; x++) {
                review.data.advantages.push(advantagesNodes[x].innerHTML);
              }
            }
            advantagesNodes = [];

            review.data.summary           = reviews[i].querySelector('div .grey-text.text-darken-2.m-font-14').innerHTML;
            review.data.starsCount        = reviews[i].querySelector('.score__meter').innerHTML;
            review.data.author            = reviews[i].querySelector('.review-box-reviewer').innerHTML;
            review.data.submissionDate    = new Date(reviews[i].querySelector('time').getAttribute('datetime')).getTime();
            review.data.recommendsProduct = reviews[i].querySelector('.review-box-header-data .uppercase.green-text').innerHTML;
            review.data.id                = new Date(reviews[i].querySelector('time').getAttribute('datetime')).getTime();;

            reviewDataArray.push(review);
          }

          console.log(reviewDataArray);

          // saving review data to product object
          product.data.reviews = reviewDataArray;

          // returns stringified JSON
          return product;
        };


        return {
            makeRequest: makeRequest,
            parseResponse: parseResponse
        };
    }
];
