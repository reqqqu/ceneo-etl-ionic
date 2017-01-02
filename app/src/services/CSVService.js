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
        var r = new RegExp(";", 'g');
        var json2 = json1.replace(/\\n/g, "")
          .replace(/\[\]/g, "\"---\"")
          .replace(r, "");
        var csv = _convert(json2);
        csv ='ADVANTAGES; DISADVANTAGES; SUMMARY; STARS COUNT; AUTHOR; SUBMISSION DATE; RECOMMENDS PRODUCT; RATED USEFUL COUNT; RATED USELESS COUNT; ID; \n' + csv;
        var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        var fileName = 'ProductReviews_' + productId + '.csv';
        saveAs(blob, fileName);
      });
    }

    function saveSingleReviewToTXT(reviewId) {

      var review = "";
      for (var count=0; count<=9; count++) {
        var name = Object.getOwnPropertyNames(reviewId)[count];
        var key =  reviewId[Object.keys(reviewId)[count]];
        review = review + name + ': ' + key + '\r\n' + '\r\n';
      }
      var id =  reviewId[Object.keys(reviewId)[9]];
      var blob = new Blob([review], {type: "text/plain;charset=utf-8"});
      var fileName = 'ReviewId_' + id + '.txt';
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