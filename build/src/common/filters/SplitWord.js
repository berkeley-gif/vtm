angular.module('filters.split', []).filter('split', [function () {
    return function (input, splitChar, splitIndex) {
      return input.split(splitChar)[splitIndex];
    };
  }]);
;