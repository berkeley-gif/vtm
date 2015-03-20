angular.module('directives.customLegendControl', []).directive('customLegendControl', [
  '$modal',
  function ($modal) {
    return {
      restrict: 'A',
      template: '<a href="" title="map legend"><i class="fa fa-bars"></i></a>',
      link: function (scope, element, attrs) {
        element.bind('click', function () {
          scope.$apply(function () {
            $modal.open({ templateUrl: 'data/data.legend.tpl.html' });
          });
        });
        element.addClass('map-control');
        element.addClass('legend-control');
      }
    };
  }
]);
;