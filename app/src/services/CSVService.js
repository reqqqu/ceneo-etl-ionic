'use strict';

module.exports = [
  'DBService',

  function (DBService) {


    /**
     * Gets reviews from product with id given in parameters and saves them as CSV file
     * @param productId
     */
    function saveProductReviewsToCSV(productId) {

      return DBService.getProductWithId(productId).then(function (productFromDB) {
        var reviews = productFromDB.reviews;
        var json1 = JSON.stringify(reviews);
        var json2 = json1.replace(/\\n/g, "")
          .replace(/\[\]/g, "\"---\"")
          .replace(";", "");
        var csv = _convert(json2);
        csv ='ADVANTAGES; DISADVANTAGES; SUMMARY; STARS COUNT; AUTHOR; SUBMISSION DATE; RECOMMENDS PRODUCT; RATED USEFUL COUNT; RATED USELESS COUNT; ID; \n' + csv;
        var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        var fileName = 'ProductReviews_' + productId + '.csv';
        saveAs(blob, fileName);
      });
    }

    function saveSingleReviewToTXT(reviewId) {
      var json = JSON.stringify(reviewId);
      var blob = new Blob([json], {type: "text/plain;charset=utf-8"});
      var fileName = 'ProductReview.txt';
      saveAs(blob, fileName);
    };

    /**
     * Converts JSON to CSV
     * @param objArray
     */
    function _convert(objArray) {
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


    return {
      saveProductReviewsToCSV: saveProductReviewsToCSV,
      saveSingleReviewToTXT: saveSingleReviewToTXT
    }
  }
];