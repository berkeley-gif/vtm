angular.module( 'services.VtmLayerService', [])

.factory('VtmLayers', ['$q', '$timeout', '$http', 'HOLOS_CONFIG',
  function($q, $timeout, $http, HOLOS_CONFIG ) {
     
     // private data vars
      //var tileserver = 'http://localhost:8080';
      var tileserver = HOLOS_CONFIG.baseUrl + '/tiles';

      var mapLayers = {
        //map tiles
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
          url: tileserver + '/cacounties/{z}/{x}/{y}.png',
          visible: true
        },
        counties_utfgrid : {
          name: 'Counties UTFGrid',
          type: 'utfGrid',
          url: tileserver + '/cacounties_utfgrid/{z}/{x}/{y}.json',
          visible: true,
          pluginOptions: { 'useJsonP': false}
        },
        //marker group
        photos : {
          name: 'VTM Photos',
          type: 'group',
          visible: true
        },
        //marker group
        photos_custom : {
          name: 'VTM2 Photos',
          type: 'custom',
          visible: true
        }
      };

      
    //public functions          
     return {
          loadLayer: function(layer) {
            return mapLayers[layer];
          },
          toggleLayer: function(layer) {
            mapLayers[layer].visible = !mapLayers[layer].visible;
            if (mapLayers[layer + '_utfgrid']){
              mapLayers[layer + '_utfgrid'].visible = !mapLayers[layer + '_utfgrid'].visible;
            }

          },
          hideLayer: function(layer) {
            mapLayers[layer].visible = false;
            if (mapLayers[layer + '_utfgrid']){
              mapLayers[layer + '_utfgrid'].visible = false;
            }
          },
          showLayer: function(layer) {
            mapLayers[layer].visible = true;
            if (mapLayers[layer + '_utfgrid']){
              mapLayers[layer + '_utfgrid'].visible = true;
            }
          }
     };

}])


;