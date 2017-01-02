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
      var extractedDataFromRequests = [];
      var transformedProduct = {};
      var transformedReviews = [];
      var extractedProductId;
      var productFromDatabase = false;

      /**
       * Resets service flags and global variables
       * @private
       */
      function _resetFlags() {
        extractedDataFromRequests = [];
        transformedProduct = {};
        transformedReviews = [];
        productFromDatabase = false;

      }


      /**
       * Checks if product page on ceneo.pl has more pages to load
       * @param data
       * @returns {boolean}
       * @private
       */
      function _hasMorePages(data) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(data, 'text/html');
        var links = doc.getElementsByTagName('link');
        var result = false;

        for(var i = 0; i < links.length; i++){
          if(links[i].hasAttribute('rel') && links[i].rel === 'next') {
            result = true;
            console.log('break', i);
            break;
          }
        }

        return result;
      }

      /**
       * Recursive method for making http requests to ceneo.pl
       * @param productId
       * @param i
       * @param callback
       * @returns {Promise}
       */
      function makeHttpRequest(productId, i, callback) {
        var deferred = $q.defer();
        HTTPService.makeRequest(productId, i, null).then(function (response) {
            extractedProductId = productId;
            extractedDataFromRequests.push(response.data);
            if (_hasMorePages(response.data)) {
              i++;
              makeHttpRequest(productId, i, callback);
            } else {
              callback(i+1);
              deferred.resolve();
            }
          },
          function (error) {
            console.log('error');
          });
        return deferred.promise;
      }

      /**
       * Public method for accessing data extraction
       * @param productId
       */
      var extractData = function (productId) {
        _resetFlags();
        var deferred = $q.defer();

        makeHttpRequest(productId, 0, function (numberOfRequestsMade) {
          deferred.resolve(numberOfRequestsMade);
        });

        return deferred.promise;
      };

      /**
       * Public method for accessing data transformation
       */
      var transformData = function() {
        return _transformExtractedData(extractedDataFromRequests, extractedProductId).then(function (productExistsInDB) {
          return productExistsInDB;
        });
      };

      /**
       * Public method for accessing data loading
       */
      var loadData = function() {
        return _loadTransformedDataToDB().then(function () {
          var numberOfReviewsAdded = transformedReviews.length;
          transformedReviews = [];
          transformedProduct = {};
          productFromDatabase = false;
          return numberOfReviewsAdded;
        });
      };

      /**
       * Transform data from html tags to javascript objects
       * @param data
       * @param productId
       * @private
       */

      var _transformExtractedData = function(dataArray, productId) {
        var transformationPromise = $q.defer();
        var _data = dataArray[0];
        var parser = new DOMParser();
        var doc = parser.parseFromString(_data, 'text/html');
        var reviewTranformationPromises = [];
        var productFromDB = false;

        /*
         * getting product containers/reviews
         */
        _getProductObject(doc, productId).then(function (data) {
          transformedProduct = data.product;
          productFromDB = data.fromDB;

          for(var i = 0; i < dataArray.length; i++) {
            doc = parser.parseFromString(dataArray[i], 'text/html');
            reviewTranformationPromises.push(
            _transformReviews(doc).then(function (reviewsArray) {
              transformedReviews = [].concat(transformedReviews, reviewsArray);
            }));
          }

          $q.all(reviewTranformationPromises).then(function () {
              transformationPromise.resolve(productFromDB);
            }
          );
        });

        return transformationPromise.promise;
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
              productPromise.resolve({
                product: productObject,
                fromDB: false
              });
            });
          } else {
            productFromDatabase = true;
            DBService.getProductWithId(productId).then(function (data) {
              productObject = data;
              productPromise.resolve({
                product: productObject,
                fromDB: true
              });
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

        deferred.resolve(reviewDataArray);
        return deferred.promise;
      };

      /**
       * Method responsible for parsing review html node to js object
       * @returns {Object}
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
