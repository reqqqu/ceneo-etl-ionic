'use strict';

/**
 * @ngdoc service
 * @name CeneoETL.EtlService
 * @description
 * # EtlService
 * Contains basic methods to extract/transform/load data
 */
module.exports = [
    '$q',
    'HTTPService',
    'ProductFactory',
    'ReviewFactory',
    'DBService',

    function($q, HTTPService, ProductFactory, ReviewFactory, DBService) {
      var extractedData;
      var transformedData;
      var extractedProductId;

      var extractData = function (productId) {
        return HTTPService.makeRequest(productId, 0, null).then(function (response) {
            extractedData = response.data;
            extractedProductId = productId;

            // if(thereisresponse) {
            // set the request flag to false
            // requestLoop = false;
            // }


          },
          function (error) {
            console.log('error');
          });
      };

      var transformData = function() {
        return _transformExtractedData(extractedData, extractedProductId).then(function (data) {
          console.log('transformed', data);
        });
      };

      var loadData = function() {

      };


      var _transformExtractedData = function(data, productId) {
        var transformationPromises = [];
        var _data = data;
        var parser = new DOMParser();
        var doc = parser.parseFromString(_data, 'text/html');

        var transformedProduct;
        var transformedReviews;

        /*
         * getting product containers/reviews
         */
        if(productId) {
          var _productId = productId; // @rk: this will be used as well when iteration through review pages is implemented
          transformationPromises.push(_transformProduct(doc, _productId).then(function (data) {
            transformedProduct = data;
          }));
        }

        /*
         * getting review containers/reviews
         */
        transformationPromises.push(_transformReviews(doc).then(function (data) {
          transformedReviews = data;
        }));

        return $q.all(transformationPromises).then(function () {
          // saving review data to product object
          for(var i = 0; i < transformedReviews.length; i++) {
            transformedProduct.reviews.push(transformedReviews[i]);
          }

          console.log(transformedProduct);
          DBService.addProduct(transformedProduct);
          return transformedProduct;
        })
      };

      var _transformProduct = function (doc, productId) {
        var deferred = $q.defer();
        var product = new ProductFactory();

        product.id = productId;
        product.category = angular.element(doc.querySelector('.breadcrumbs'))[0].querySelectorAll(".breadcrumb")[1].querySelector("span").innerHTML;

        var metaNodes = angular.element(doc.querySelector('head'))[0].querySelectorAll("meta");
        if(metaNodes) {
          for(var i=0; i<metaNodes.length; i++) {
            if(metaNodes[i].hasAttribute("property") && metaNodes[i].getAttribute("property") === "og:brand") {
              product.brand = metaNodes[i].getAttribute("content");
            }
          }
        }
        product.model = angular.element(doc.querySelector(".js_searchInGoogleTooltip"))[0].innerHTML.replace(/product.brand /ig, "");
        var modelRegexp = new RegExp(product.brand + " ", "ig");
        product.model = product.model.replace(modelRegexp, "");

        deferred.resolve(product);
        return deferred.promise;
      };


      var _transformReviews = function (doc) {
        var deferred = $q.defer();
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

        deferred.resolve(reviewDataArray);
        return deferred.promise;
      };

      return {
        extractData : extractData,
        transformData: transformData,
        loadData: loadData
      };
    }
];
