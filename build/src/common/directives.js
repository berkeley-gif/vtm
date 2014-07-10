customDirectives = angular.module('customDirectives', []);

customDirectives.directive('disableAnimation', function($animate){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            attrs.$observe('disableAnimation', function(value){
                $animate.enabled(!value, element);
            });
        }
    };
});

customDirectives.directive('ngDemo', function($animate, $window, $timeout){
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
});

customDirectives.directive('animatedBanner', function($animate, $window, $timeout){
    return {
		restrict: 'E',
		link: function(scope, element, attrs) {
			var image = scope.image;
			console.log(image);

			scope.$watch('image', function(newVal) {
				if (newVal) {
				$animate.addClass(element, 'animated fadeIn', function() {
					$timeout(function() {
						$animate.removeClass(element, 'animated fadeOut');
					}, 2000);
				});
				}
			});
		}
  };
});