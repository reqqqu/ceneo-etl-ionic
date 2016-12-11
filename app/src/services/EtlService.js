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
      var transformData = function() {};

      var loadData = function() {};

      return {
        transformData: transformData,
        loadData: loadData
      };
    }
];
