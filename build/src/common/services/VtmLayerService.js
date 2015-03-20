angular.module('services.VtmLayerService', []).factory('VtmLayers', [
  '$q',
  '$timeout',
  '$http',
  'ENV',
  function ($q, $timeout, $http, ENV) {
    var tileserver = ENV.apiEndpoint + '/tiles';
    var mapLayers = {
        grayscale: {
          name: 'Basemap',
          type: 'xyz',
          url: 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
          visible: true,
          layerOptions: {
            continuousWorld: true,
            maxZoom: 18
          }
        },
        plots: {
          name: 'VTM Plots',
          type: 'xyz',
          url: tileserver + '/vtmplots/{z}/{x}/{y}.png',
          visible: true
        },
        veg: {
          name: 'Vegetation',
          type: 'xyz',
          url: tileserver + '/vtmveg/{z}/{x}/{y}.png',
          visible: true
        },
        quads: {
          name: 'VTM Quads',
          type: 'xyz',
          url: tileserver + '/vtmquads/{z}/{x}/{y}.png',
          visible: true
        },
        counties: {
          name: 'Counties',
          type: 'xyz',
          url: tileserver + '/cacounties/{z}/{x}/{y}.png',
          visible: true
        },
        photos: {
          name: 'VTM Photos',
          type: 'group',
          visible: true
        }
      };
    return {
      loadLayer: function (layer) {
        return mapLayers[layer];
      },
      toggleLayer: function (layer) {
        mapLayers[layer].visible = !mapLayers[layer].visible;
      },
      isVisible: function (layer) {
        return mapLayers[layer].visible;
      },
      hideLayer: function (layer) {
        mapLayers[layer].visible = false;
      },
      showLayer: function (layer) {
        mapLayers[layer].visible = true;
      }
    };
  }
]);
;