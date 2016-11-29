'use strict';

/**
 * @ngdoc function
 * @name CeneoETL.service:DBService
 * @description
 * # Database service used to store data
 */
module.exports = [
  'pouchDB',
  '$q',

  function(pouchDB, $q) {
    var db = pouchDB('dbName');
    var q = $q.defer();

    //@todo: refactoring - just a sample - might need changes according to chosen approach for storing data
    var readRecord = function(query) {
      var _docId = '';
      if(query.id || query._id) {
        _docId = query.id || query._id;
      }
      return db.get(_docId)
        .then(function(rec) {
          q.resolve(rec);
        }, function(err) {
          if(err.status === 404) {
            console.log('Error 404, record not found.');
            q.reject(null);
          } else {
            console.log('An error occured while getting record.');
            q.reject(err);
          }
        })
        .catch(function(err) {
          console.log(err);
          q.reject(err);
        });

      return q.promise;
    };

    // public api
    //@todo: add remaining CRUD methods for database management
    return {
      //createRecord: createRecord
      readRecord: readRecord
      //updateRecord: updateRecord,
      //deleteRecord: deleteRecord
    };
  }
];
