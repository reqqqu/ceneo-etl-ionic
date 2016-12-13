'use strict';

/**
 * @ngdoc function
 * @name CeneoETL.service:ExampleService
 * @description
 * # ExampleService
 */
module.exports = [
    '$http',

    function($http) {
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
                console.log('An error occured while getting ETL server data.');
                return null;
            });
        };

        var parseResponse = function(data, responseIndex, productId) {
          var _data = data;
          var parser = new DOMParser();
          var doc = parser.parseFromString(_data, 'text/html');
          var _productId = "";

          // @todo: getting product containers/elements to map only for the first req
          if(responseIndex === 1) {
            var productContainer = "";
              _productId = productId;
          }

          // getting review containers/reviews
          var reviewsContainer = angular.element(doc.querySelector(".review-box-items-list"));
          var reviews = reviewsContainer[0].getElementsByClassName("review-box-item");

          // getting review details to map
          var disadventages = [];
          var advantages = [];
          var summary = '';
          var starsCount = 0;
          var author =  '';
          var submissionDate = null;
          var recommendsProduct = false;
          var ratedUsefulCount = 0;
          var ratedUselessCount = 0;
          var id = '';
          var reviewDataArray = [];

          for(var i=0; i<reviews.length; i++) {
            //@todo: extract the rest of the props from res n put it into array to map
            id = new Date(reviews[i].querySelector("time").getAttribute("datetime")).getTime(); //id (timestamp)
            reviewDataArray.push();
          }

          // returns maps to do whatever next
          return mapData();
        };

        var mapData = function(reviewDataArray, productDataArray, productId) {
          // map product properties if it's the first request (if the productId exists)
          if(productId) {
            var product = {
              id: '',
              category: '',
              brand: '',
              model: '',
              additionalFeatures: [],
              reviews: []
            };

            for(var i=0; i<productDataArray.length; i++) {
              for(var prop in product) {
                if(i) {
                  product[prop] = i;
                }
              }
            }
          }

          // map review properties
          var review = {
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

          for(var i=0; i<reviewDataArray.length; i++) {
            if(i) {
              for(var prop in review) {
                review[prop] = i;
              }
            }
          }
        };

        return {
            makeRequest: makeRequest,
            parseResponse: parseResponse
        };
    }
];
