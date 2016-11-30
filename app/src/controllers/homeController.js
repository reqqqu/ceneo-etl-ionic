'use strict';

/**
 * @ngdoc function
 * @name CeneoETL.controller:HomeController
 * @description
 * # HomeController
 */
module.exports = [
    '$scope',
    'ExampleService',

    function( $scope, ExampleService ) {
      $scope.hasExtractFinished = false;
      $scope.hasTransformFinished = false;
    }
];
