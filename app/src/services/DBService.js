'use strict';

/**
 * @ngdoc function
 * @name CeneoETL.service:DBService
 * @description
 * # Database service used to store data
 */
module.exports = [
    'pouchDB',
    'Loki',
    '$q',

  function(pouchDB, Loki, $q) {
    var q = $q.defer();

      var _db;
      var _products;
      var _productsIds = [];

      function initDB() {
          //var adapter = new LokiCordovaFSAdapter({"prefix": "loki"});
          _db = new Loki('ceneoDB',
              {
                  autosave: true,
                  autosaveInterval: 1000//, // 1 second
                  //adapter: adapter
              });
          console.log(_db);
      };

      function getAllProducts() {
        return $q(function (resolve, reject) {
          var options = {};

          _db.loadDatabase(options, function () {
            _products = _db.getCollection('products');

            if (!_products) {
              _products = _db.addCollection('products');
            }

            _getProductsIds();
            resolve(_products.data);
          });
        });
      }

      function addProduct(product) {
        if (!_products || !_productsIds) {
          getAllProducts();
        }

        if (isProductInDB(product.id)) {
          return;
        }

        let varrr = _products.insert(product);
        _addProductId(product.id);
        console.log(_db, varrr);
        console.log(_productsIds);
      }

      function updateProduct(product) {
        _products.update(product);
      }

      function deleteProduct(product) {
        _products.remove(product);
      }

      function isProductInDB(productId) {
        return _productsIds.some(function (id) {
          return productId === id;
        });
      }

      function _getProductsIds() {
        for (var key in _products.data) {
          _productsIds.push(_products.data[key].id);
        }
      }

      function _addProductId(productId) {
        _productsIds.push(productId);
      }



    // public api
    //@todo: add remaining CRUD methods for database management
    return {
      initDB : initDB,
      getAllProducts: getAllProducts,
      addProduct: addProduct,
      updateProduct: updateProduct,
      deleteProduct: deleteProduct,
    };
  }
];
