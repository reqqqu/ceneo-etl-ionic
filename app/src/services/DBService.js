'use strict';

/**
 * @ngdoc function
 * @name CeneoETL.service:DBService
 * @description
 * #DBService resposible for database management and CRUD methods
 */
module.exports = [
    'Loki',
    '$q',

  function(Loki, $q) {
      var _db;
      var _products;

    /**
     * Initializes databes and loads data from browser memory
     */
    function initDB() {

          var idbAdapter = new LokiIndexedAdapter();
          var databaseName = 'ceneoEtlDB';
          var options = {
            adapter: idbAdapter,
            autoload: true,
            autosave: true,
            autosaveInterval: 1000
          };

          _db = new Loki(databaseName, options);

          //try to get products collection
          _products = _db.getCollection('products');

          //Adds collection of products if it's not present already
          if (!_products) {
            _products = _db.addCollection('products', {
              indices: ['id']
            });
          }
      }

    /**
     * Gets array of all products from database
     * @returns {Promise}
     */
      function getAllProducts() {
        return $q(function (resolve, reject) {
          var options = {};

          _db.loadDatabase(options, function () {
            _products = _db.getCollection('products');
            resolve(_products.data);
          });
        });
      }

    /**
     * Adds new product to database
     * @param product {Object}
     */
      function addProduct(product) {
        _products.insert(product);
      }

    /**
     * Updates given product in database
     * @param product {Object}
     */
      function updateProduct(product) {
        _products.update(product);
      }

    /**
     * Deletes given product from database
     * @param product {Object}
     */
      function deleteProduct(product) {
        _products.remove(product);
      }

    /**
     * Checks if product with given id is alredy in database
     * @param productId {number}
     */
      function isProductInDB(productId) {
        return getProductWithId(productId).then(function (data) {
          return data !== undefined;
        });
      }

    /**
     * Gets product with given id from database
     * @param productId {number}
     */
      function getProductWithId(productId) {
        return getAllProducts().then(function () {
          return _products.find({ id : productId})[0];
        });
      }

    /**
     * Updates reviews for product with id given in parameters
     * @param productId {number}
     * @param reviews
     */
      function updateReviews(productId, reviews) {
        return getProductWithId(productId).then(function (productFromDB) {
          productFromDB.reviews = [].concat(productFromDB.reviews, reviews);
          updateProduct(productFromDB);
        })
      }

    /**
     * Removes all reviews from product with id given in parameters
     * @param productId {number}
     */
      function removeReviewsFromProduct(productId) {

        return getProductWithId(productId).then(function (productFromDB) {
          productFromDB.reviews = [];
          updateProduct(productFromDB);
        });
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
      removeReviewsFromProduct: removeReviewsFromProduct
    };
  }
];
