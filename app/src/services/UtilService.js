'use strict';

/**
 * @ngdoc service
 * @name CeneoETL.UtilService
 * @description
 * # UtilService
 * Contains utility methods for modifying strings, calculating stuff, parsing data, etc.
 */
module.exports = [
	'$http',

  function($http) {
  	var makeRequest = function(url, requestType, params) {
      this.requestUrl = url;
      this.customUrl = "";
      this.ceneoUrl = "http://www.ceneo.pl/";
      this.prefix = [
        window.location.origin,
        window.location.pathname,
        "proxy?url="
      ].join("");

  		if(this.requestUrl) {
    		this.customUrl = [
	    		this.prefix,
	    		this.ceneoUrl,
    			url,
    			"/opinie-1;0160-1"
    		].join("");
  		} else {
  			console.log("Missing product URL/ID.");
  			return null;
  		}

      return $http({
        method: 'GET',
        url: this.customUrl
      }).success(function(res) {
        console.log('Successfully got ETL server data.', res);
        return res;
      }).error(function(err) {
        console.log('An error occured while getting ETL server data.', err);
        return null;
      });
    };

    var parseResponse = function(data) {};
    
    return {
    	makeRequest: makeRequest,
      parseResponse: parseResponse
    };
  }
];
