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
          var product = {
            id                  : '',
            category            : '',
            brand               : '',
            model               : '',
            additionalFeatures  : [],
            reviews             : []
          };
          var productString = "";

          product.id = productId;

          /*
           * getting review containers/reviews
           */
          var reviewsContainer = angular.element(doc.querySelector(".review-box-items-list"));
          var reviews = reviewsContainer[0].getElementsByClassName("review-box-item");


          var review              = {};

          var disadvantages       = [];
          var advantages          = [];
          var summary             = '';
          var starsCount          = 0;
          var author              =  '';
          var submissionDate      = null;
          var recommendsProduct   = false;
          var ratedUsefulCount    = 0; // @rk: n/a in mobile mode (m.ceneo.pl req)
          var ratedUselessCount   = 0; // @rk: n/a in mobile mode (m.ceneo.pl req)
          var id                  = '';
          var reviewDataArray     = [];

          for(var i=0; i<reviews.length; i++) {
            // getting review details to map
            disadvantages         = [];
            advantages            = [];
            summary               = '';
            starsCount            = 0;
            author                =  '';
            submissionDate        = null;
            recommendsProduct     = false;
            ratedUsefulCount      = 0;
            ratedUselessCount     = 0;
            id                    = '';

            var disadvantagesNodes = reviews[i].querySelectorAll(".product-pros-cons .red-text + .no-margin--top.no-margin--bottom.grey-text.text-darken-2.m-font-14 li");
            if(disadvantagesNodes.length > 0) {
                for(var x=0; x<disadvantagesNodes.length; x++) {
                  disadvantages.push(disadvantagesNodes[x].innerHTML);
                }
            }
            disadvantagesNodes = [];

            var advantagesNodes = reviews[i].querySelectorAll(".product-pros-cons .green-text + .no-margin--top.no-margin--bottom.grey-text.text-darken-2.m-font-14 li");
            if(advantagesNodes.length > 0) {
              for(var x=0; x<advantagesNodes.length; x++) {
                advantages.push(advantagesNodes[x].innerHTML);
              }
            }
            advantagesNodes = [];

            summary           = reviews[i].querySelector("div .grey-text.text-darken-2.m-font-14").innerHTML;
            starsCount        = reviews[i].querySelector(".score__meter").innerHTML;
            author            = reviews[i].querySelector(".review-box-reviewer").innerHTML;
            submissionDate    = reviews[i].querySelector("time").getAttribute("datetime");
            recommendsProduct = reviews[i].querySelector(".review-box-header-data .uppercase.green-text").innerHTML;
            id                = new Date(submissionDate).getTime();

            // rk@todo: pass it to mapReviewData later on to make the code cleaner
            var review = {
              "disadvantages"       : disadvantages,
              "advantages"          : advantages,
              "summary"             : summary,
              "starsCount"          : starsCount,
              "author"              : author,
              "submissionDate"      : submissionDate,
              "recommendsProduct"   : recommendsProduct,
              "ratedUsefulCount"    : ratedUsefulCount,
              "ratedUselessCount"   : ratedUselessCount,
              "id"                  : id
            };

            reviewDataArray.push(review);
            // reviewsMapArray.push(mapReviewData(reviewDataArray)); // @rk: this will be used in refactoring
          }

          console.log(reviewDataArray);

          // saving review data to product object
          product.reviews = reviewDataArray;

          // returns stringified JSON
          return JSON.stringify(product);
        };

        // @rk: this method will be used in refactoring
        var mapProductData = function(productDataArray) {
          // map product properties
          if(productId) {
            var product = {
              id                  : '',
              category            : '',
              brand               : '',
              model               : '',
              additionalFeatures  : [],
              reviews             : []
            };

            for(var i=0; i<productDataArray.length; i++) {
              for(var prop in product) {
                product[prop] = productDataArray[i];
              }
            }
          }
        };

        // @rk: this method will be used in refactoring
        var mapReviewData = function(reviewDataArray) {
          // map review properties
          var review = {
            disadvantages         : [],
            advantages            : [],
            summary               : '',
            starsCount            : 0,
            author                : '',
            submissionDate        : null,
            recommendsProduct     : false,
            ratedUsefulCount      : 0,
            ratedUselessCount     : 0,
            id                    : ''
          };

          for (var i = 0; i < reviewDataArray.length; i++) {
            for (var prop in review) {
              review[prop] = reviewDataArray[i];
            }
          };
        };

        return {
            makeRequest: makeRequest,
            parseResponse: parseResponse
        };
    }
];
