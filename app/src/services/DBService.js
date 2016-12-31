'use strict';

/**
 * @ngdoc function
 * @name CeneoETL.service:DBService
 * @description
 * # Database service used to store data
 */
module.exports = [
    'Loki',
    '$q',

  function(Loki, $q) {
    var q = $q.defer();

      var _db;
      var _products;

      function initDB() {
        var idbAdapter = new LokiIndexedAdapter();
          _db = new Loki('ceneoDB',
              {
                  autosave: true,
                  autosaveInterval: 1000,//, // 1 second
                  adapter: idbAdapter
              });
        if (!_products) {
          _products = _db.addCollection('products', {
            indices: ['id']
          });
        }
          console.log(_products);
      };

    /**
     * Gets PRODUCTS table from database
     * @returns {*}
     */
      function getAllProducts() {
        return $q(function (resolve, reject) {
          var options = {};

          _db.loadDatabase(options, function () {
            _products = _db.getCollection('products');
            console.log('PRODUCTS IN DB', _products.data);
            resolve(_products.data);
          });
        });
      }

    /**
     * Adds new product to database
     * @param product
     */
      function addProduct(product) {
        _products.insert(product);
        console.log('----PRODUCT ADDED TO DATABASE----');
      }

    /**
     * Updates given product in database
     * @param product
     */
      function updateProduct(product) {
        _products.update(product);
      }

    /**
     * Deletes given product from database
     * @param product
     */
      function deleteProduct(product) {
        _products.remove(product);
      }

    /**
     * Checks if product with given id is alredy in database
     * @param productId
     */
      function isProductInDB(productId) {
        return getProductWithId(productId).then(function (data) {
          return data !== undefined;
        });
      }

    /**
     * Gets product with given id from database
     * @param productId
     */
      function getProductWithId(productId) {
        return getAllProducts().then(function () {
          return _products.find({ id : productId})[0];
        });
      }

    /**
     * Updates reviews for product with id given in parameters
     * @param productId
     * @param reviews
     */
      function updateReviews(productId, reviews) {
        return getProductWithId(productId).then(function (productFromDB) {
          productFromDB.reviews = [].concat(productFromDB.reviews, reviews);
          updateProduct(productFromDB);
          console.log('PRODUCT UPDATED WITH REVIEWS ', reviews);
        })
      }

    /**
     * Removes all reviews from product with id given in parameters
     * @param productId
     */
      function removeReviewsFromProduct(productId) {

        return getProductWithId(productId).then(function (productFromDB) {
          productFromDB.reviews = [];
          updateProduct(productFromDB);
          console.log('REVIEWS CLEARED FROM PRODUCT', productFromDB);
        });
      }

       /**
       * Gets reviews from product with id given in parameters and saves them as CSV file
       * @param productId
       */
      function getReviewsFromProduct(productId) {

        return getProductWithId(productId).then(function (productFromDB) {
          var reviews = productFromDB.reviews;
          var json1 = JSON.stringify(reviews);
          var json2 = json1.replace(/\\n/g, "")
                           .replace(/\[\]/g, "\"---\"");
          var csv = convert(json2);
          csv ='ADVANTAGES; DISADVANTAGES; SUMMARY; STARS COUNT; AUTHOR; SUBMISSION DATE; RECOMMENDS PRODUCT; RATED USEFUL COUNT; RATED USELESS COUNT; ID; \n' + csv;
          var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
          saveAs(blob, "Reviews.csv");
        });
      }

       /**
       * Converts JSON to CSV
       * @param objArray
       */
      function convert(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '';

        for (var i = 0; i < array.length; i++) {
          var line = '';
          for (var index in array[i]) {
            if (line != '') line += ';'
            line += array[i][index];
          }
            str += line + '\r\n';
        }
        return str;
      }

    // public api
    return {
      initDB : initDB,
      getAllProducts: getAllProducts,
      addProduct: addProduct,
      updateProduct: updateProduct,
      deleteProduct: deleteProduct,
      isProductInDB: isProductInDB,
      getProductWithId: getProductWithId,
      updateReviews: updateReviews,
      removeReviewsFromProduct: removeReviewsFromProduct,
      getReviewsFromProduct: getReviewsFromProduct
    };
  }
];
