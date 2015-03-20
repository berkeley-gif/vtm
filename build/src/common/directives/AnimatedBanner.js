angular.module('directives.animatedBanner', []).directive('animatedBanner', [
  '$animate',
  '$window',
  '$timeout',
  function ($animate, $window, $timeout) {
    return {
      restrict: 'E',
      link: function (scope, element, attrs) {
        var image = scope.image;
        scope.$watch('image', function (newVal) {
          if (newVal) {
            $animate.addClass(element, 'animated fadeIn', function () {
              $timeout(function () {
                $animate.removeClass(element, 'animated fadeOut');
              }, 2000);
            });
          }
        });
      }
    };
  }
]);
;