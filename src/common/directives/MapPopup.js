angular.module( 'directives.customMapPopup', ['services.VtmLayerService'])

.directive('customMapPopup', ['VtmLayers',
  function(VtmLayers){
    return {
      restrict: 'A',
      scope: {
        layerProp: '='
      },
      templateUrl: 'data/popup/plots.popup.tpl.html',
      link: function(scope, element, attrs) {

/*        var layer = attrs.layer;

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
        element.addClass('layer-control');*/


      }

    };

}])

;