angular.module( 'directives.customLayerControl', ['services.VtmLayerService'])

.directive('customLayerControl', ['VtmLayers',
  function(VtmLayers){
    return {
      restrict: 'A',
      scope: {
        icon: '@',
        layer: '@',
        defaultLayer: '@?'
      },
      template: '<a href="" title="{{ layer }} Show/Hide"><i class="{{ icon }}"></i></a>',
      link: function(scope, element, attrs) {

        var layer = attrs.layer;

        element.bind('click', function() {
          scope.$apply( function() {
            VtmLayers.toggleLayer(layer);
            element.toggleClass('disabled');
          });
        });

        if (VtmLayers.isVisible(layer)) {
          if ( element.hasClass('disabled') ) {
            element.removeClass('disabled');
          }          
        } else {
          element.addClass('disabled');
        }

        element.addClass('map-control');
        element.addClass('layer-control');


      }

    };

}])

;
