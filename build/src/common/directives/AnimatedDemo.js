angular.module( 'directives.ngDemo', [])

.directive('ngDemo', ['$animate', '$window', '$timeout',
  function($animate, $window, $timeout){
    return {
    restrict: 'E',
    template: '<h1>{{score}}</h1>',
    replace: true,
    link: function(scope, element, attrs) {
      scope.score = 0;
      
      (function _loop() {
        $timeout(function() {
          scope.score = $window.Math.random();
          
          _loop();
        }, 5000);
      })();
      
      scope.$watch('score', function(newVal) {
        if (newVal > 0.5) {
          $animate.addClass(element, 'animated fadeIn', function() {
            $timeout(function() {
              $animate.removeClass(element, 'animated fadeOut');
            }, 1000);
          });
        }
      });
    }
  };

}])

;

