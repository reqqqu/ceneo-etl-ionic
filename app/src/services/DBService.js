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

      function addProduct(product) {
        _products.insert(product);
        console.log('----PRODUCT ADDED TO DATABASE----');
      }

      function updateProduct(product) {
        _products.update(product);
      }

      function deleteProduct(product) {
        _products.remove(product);
      }

      function isProductInDB(productId) {
        return getProductWithId(productId).then(function (data) {
          return data !== undefined;
        });
      }

      function getProductWithId(productId) {
        return getAllProducts().then(function () {
          return _products.find({ id : productId})[0];
        });
      }
      function updateReviews(productId, reviews) {
        return getProductWithId(productId).then(function (productFromDB) {
          productFromDB.reviews = [].concat(productFromDB.reviews, reviews);
          updateProduct(productFromDB);
          console.log('PRODUCT UPDATED WITH REVIEWS ', reviews);
        })
      }



    // public api
    //@todo: add remaining CRUD methods for database management
    return {
      initDB : initDB,
      getAllProducts: getAllProducts,
      addProduct: addProduct,
      updateProduct: updateProduct,
      deleteProduct: deleteProduct,
      isProductInDB: isProductInDB,
      getProductWithId: getProductWithId,
      updateReviews: updateReviews
    };
  }
];
