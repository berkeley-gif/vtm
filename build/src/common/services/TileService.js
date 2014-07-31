angular.module( 'services.VtmTileService', [])

.factory('VtmTiles', ['$q', '$timeout', '$http', 'HOLOS_CONFIG',
  function($q, $timeout, $http, HOLOS_CONFIG ) {
     
     // private data vars
      //ar tileserver = 'http://localhost:8080';
      var tileserver = HOLOS_CONFIG.baseUrl + '/tiles';

      var tileLayers = {
        grayscale : {
          name: 'Basemap',
          type: 'xyz',
          url: 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
          visible: true,
          layerOptions: {
            continuousWorld: true,
            maxZoom: 18
          } 
        },
        plots : {
          name: 'VTM Plots',
          type: 'xyz',
          url: tileserver + '/vtmplots/{z}/{x}/{y}.png',
          visible: true
        },
        plots_utfgrid : {
          name: 'VTM Plots UTFGrid',
          type: 'utfGrid',
          url: tileserver + '/vtmplots_utfgrid/{z}/{x}/{y}.json',
          visible: true,
          pluginOptions: { 'useJsonP': false}
        },
        veg : {
          name: 'Vegetation',
          type: 'xyz',
          url: tileserver + '/vtmveg/{z}/{x}/{y}.png',
          visible: true
        },
        veg_utfgrid : {
          name: 'VTM Veg UTFGrid',
          type: 'utfGrid',
          url: tileserver + '/vtmveg_utfgrid/{z}/{x}/{y}.json',
          visible: true,
          pluginOptions: { 'useJsonP': false}
        },
        quads : {
          name: 'VTM Quads',
          type: 'xyz',
          url: tileserver + '/vtmquads/{z}/{x}/{y}.png',
          visible: true
        },
        quads_utfgrid : {
          name: 'VTM Quads UTFGrid',
          type: 'utfGrid',
          url: tileserver + '/vtmquads_utfgrid/{z}/{x}/{y}.json',
          visible: true,
          pluginOptions: { 'useJsonP': false}
        },
        counties : {
          name: 'Counties',
          type: 'xyz',
          url: tileserver + '/counties/{z}/{x}/{y}.png',
          visible: true
        },
        counties_utfgrid : {
          name: 'Counties UTFGrid',
          type: 'utfGrid',
          url: tileserver + '/counties_utfgrid/{z}/{x}/{y}.json',
          visible: true,
          pluginOptions: { 'useJsonP': false}
        }
      };

      
    //public functions          
     return {
          loadLayer: function(layer) {
            return tileLayers[layer];
          },
          toggleLayer: function(layer) {
            tileLayers[layer].visible = !tileLayers[layer].visible;
          },
          hideLayer: function(layer) {
            tileLayers[layer].visible = false;
          },
          showLayer: function(layer) {
            tileLayers[layer].visible = true;
          }
     };

}])


;