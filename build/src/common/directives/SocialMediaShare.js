angular.module( 'directives.socialMedia', [])

.directive('facebookShare', ['$window',
  function($window) {
    return {
        restrict: 'A',
        template: '<div class="fb-like" data-layout="button_count" data-action="like" data-show-faces="true" data-share="true"></div>',
        link: function (scope, element, attrs) {
            scope.$watch(function () { return !!$window.FB; },
                function (fbIsReady) {
                    if (fbIsReady) {
                        $window.FB.XFBML.parse(element.parent()[0]);
                    }
                });
        }
    };
  }

])

;

