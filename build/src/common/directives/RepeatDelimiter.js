angular.module('directives.repeatDelimiter', []).directive('repeatDelimiter', [function () {
    function compile(element, attributes) {
      var delimiter = attributes.bnRepeatDelimiter || ',';
      var delimiterHtml = '<span ng-show=\' ! $last \'>' + delimiter + '</span>';
      var html = element.html().replace(/(\s*$)/i, function (whitespace) {
          return delimiterHtml + whitespace;
        });
      element.html(html);
    }
    return {
      compile: compile,
      priority: 1001,
      restirct: 'A'
    };
  }]);
;