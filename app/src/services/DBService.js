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

            resolve(_products.data);
          });
        });
      }

      function addProduct(product) {
        _products.insert(product)
      }

      function updateProduct(product) {
        _products.update(product);
      }

      function deleteProduct(product) {
        _products.remove(product);
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
