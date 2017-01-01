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
      var transformedProduct = {};
      var transformedReviews = [];
      var extractedProductId;
      var productFromDatabase = false;


      /**
       * Public method for accessing data extraction
       * @param productId
       */
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

      /**
       * Public method for accessing data transformation
       */
      var transformData = function() {
        return _transformExtractedData(extractedData, extractedProductId).then(function (data) {
          console.log('TRANSFORMED PRODUCT BEFORE ADDING REVIEWS', transformedProduct, 'REVIEWS TO ADD TO PRODUCT',  transformedReviews);
        });
      };

      /**
       * Public method for accessing data loading
       */
      var loadData = function() {
        return _loadTransformedDataToDB().then(function () {
          transformedReviews = [];
          transformedProduct = {};
          productFromDatabase = false;
        });
      };


      /**
       * Transform data from html tags to javascript objects
       * @param data
       * @param productId
       * @private
       */

      var _transformExtractedData = function(data, productId) {
        var tranformationPromise = $q.defer();
        var _data = data;
        var parser = new DOMParser();
        var doc = parser.parseFromString(_data, 'text/html');

        /*
         * getting product containers/reviews
         */
        _getProductObject(doc, productId).then(function (productObject) {
          transformedProduct = productObject;
          _transformReviews(doc).then(function (reviewsArray) {
            transformedReviews = reviewsArray;
            tranformationPromise.resolve(true);

          });
        });

        return tranformationPromise.promise;

        /*
         * getting review containers/reviews
         */
      };

      /**
       * Gets Product object form database if it exists or creates object from html
       * @param productId
       * @returns {Promise}
       * @private
       */
      function _getProductObject(doc, productId) {
        var productPromise = $q.defer();
        var productObject = {};

        DBService.isProductInDB(productId).then(function (isInDB) {
          if(!isInDB) {
            var _productId = productId; // @rk: this will be used as well when iteration through review pages is implemented
            _transformProduct(doc, _productId).then(function (data) {
              productObject = data;
              console.log('NEW PRODUCT. EXTRACTED FROM FROM HTML ', productObject);
              productPromise.resolve(productObject);
            });
          } else {
            productFromDatabase = true;
            DBService.getProductWithId(productId).then(function (data) {
              productObject = data;
              console.log('PRODUCT ALREADY IN DB ', productObject);
              productPromise.resolve(productObject);
            });
          }
        });

        return productPromise.promise;
      }

      /**
       * Transform product data from html tags to javascript objects
       * @param doc
       * @param productId
       * @returns {Promise}
       * @private
       */
      var _transformProduct = function (doc, productId) {
        var deferred = $q.defer();
        var product = new ProductFactory.Product();

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


      /**
       * Transform review data from html tags to javascript objects
       * Returns ONLY reviews that are not in database
       *
       * @param doc
       * @returns {Promise}
       * @private
       */
      var _transformReviews = function (doc) {
        var deferred = $q.defer();
        var reviewsContainer = angular.element(doc.querySelector('.product-reviews'));
        var reviews = reviewsContainer[0].querySelectorAll('li.product-review');
        var reviewDataArray = [];
        var newReviewsCount = 0;


        for(var i=0; i<reviews.length; i++) {

          var reviewId = new Date(reviews[i].querySelector('time').getAttribute('datetime')).getTime();

          // check if review already exists in database
          if (!ProductFactory.hasReview(transformedProduct, reviewId)) {
            var reviewObject = _getReviewObjectFromHTML(reviews[i]);
            reviewDataArray.push(reviewObject);
            newReviewsCount++;
          };
        }

        console.log( newReviewsCount, 'NEW REVIEWS TO ADD TO PRODUCT');

        deferred.resolve(reviewDataArray);
        return deferred.promise;
      };

      /**
       * Method responsible for parsing review html node to js object
       * @returns {*}
       * @private
       */
      function _getReviewObjectFromHTML(reviewNode) {
        var review             = new ReviewFactory();
        var advantagesNodes = reviewNode.querySelectorAll('.pros-cell ul li');
        if(advantagesNodes.length > 0) {
          for(var x=0; x<advantagesNodes.length; x++) {
            review.advantages.push(advantagesNodes[x].innerHTML);
          }
        }
        advantagesNodes = [];

        var disadvantagesNodes = reviewNode.querySelectorAll('.cons-cell ul li');
        if(disadvantagesNodes.length > 0) {
          for(var x=0; x<disadvantagesNodes.length; x++) {
            review.disadvantages.push(disadvantagesNodes[x].innerHTML);
          }
        }
        disadvantagesNodes = [];

        review.summary           = reviewNode.querySelector('.product-review-body').innerHTML;
        review.starsCount        = reviewNode.querySelector('.review-score-count').innerHTML;
        if(review.starsCount) {
          review.starsCount = review.starsCount.replace(/\/\d*/, "");
        }
        review.author            = reviewNode.querySelector('.product-reviewer').innerHTML;
        review.submissionDate    = reviewNode.querySelector('time').getAttribute('datetime');
        review.recommendsProduct = reviewNode.querySelector('.product-review-summary');
        if(review.recommendsProduct) {
          review.recommendsProduct = review.recommendsProduct.querySelector("em").innerHTML;
        }
        review.ratedUsefulCount = reviewNode.querySelector(".vote-yes").getAttribute("data-vote");
        review.ratedUselessCount = reviewNode.querySelector(".vote-no").getAttribute("data-vote");
        review.id                = new Date(review.submissionDate).getTime();

        return review;
      }

      /**
       * Loades product data to database
       * @returns {Promise}
       * @private
       */
      function _loadTransformedDataToDB() {
        var deferred = $q.defer();

        if (!productFromDatabase) {
          transformedProduct.reviews = transformedReviews;
          DBService.addProduct(transformedProduct);
          deferred.resolve(true);
        } else {
          DBService.updateReviews(transformedProduct.id, transformedReviews).then(function () {
              deferred.resolve(true);
          });
        }
        return deferred.promise;
      }

      return {
        extractData : extractData,
        transformData: transformData,
        loadData: loadData
      };
    }
];
