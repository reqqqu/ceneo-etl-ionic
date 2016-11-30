'use strict';

/**
 * @ngdoc service
 * @name CeneoETL.EtlService
 * @description
 * # EtlService
 * Contains basic methods to extract/transform/load data
 */
module.exports = [
    '$http',

    function($http) {
      var extractData = function(xhr) {
        var _url = '';
        if(xhr.url) {
          _url = xhr.url;
        }
        return $http({
          method: 'GET',
          url: _url
        }).success(function(res) {
          console.log('Successfully got ETL server data.', res);
          return res;
        }).error(function(err) {
          console.log('An error occured while getting ETL server data.', err);
          return null;
        });
      };

      var transformData = function() {};

      var loadData = function() {};


      return {
        extractData: extractData,
        transformData: transformData,
        loadData: loadData
      };
    }
];
