angular.module( 'services.VtmTileService', [])

.factory('VtmTiles', ['$q', '$timeout', '$http', 'HOLOS_CONFIG',
  function($q, $timeout, $http, HOLOS_CONFIG ) {
     
     // private data vars
      //ar tileserver = 'http://localhost:8080';
      var tileserver = HOLOS_CONFIG.baseUrl + '/tiles';

      var grayscale = {
        name: 'Basemap',
        type: 'xyz',
        url: 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
        layerOptions: {
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + 
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
          continuousWorld: true,
          maxZoom: 18
        }
      };

      var plots = {
        name: 'VTM Plots',
        type: 'xyz',
        url: tileserver + '/vtmplots/{z}/{x}/{y}.png',
        visible: true
      };

      var plots_utfgrid = {
        name: 'VTM Plots UTFGrid',
        type: 'utfGrid',
        url: tileserver + '/vtmplots_utfgrid/{z}/{x}/{y}.json',
        visible: true,
        pluginOptions: { 'useJsonP': false}
      };

      var veg = {
        name: 'Vegetation',
        type: 'xyz',
        url: tileserver + '/vtmveg/{z}/{x}/{y}.png',
        visible: true
      };

      var veg_utfgrid = {
        name: 'VTM Veg UTFGrid',
        type: 'utfGrid',
        url: tileserver + '/vtmveg_utfgrid/{z}/{x}/{y}.json',
        visible: true,
        pluginOptions: { 'useJsonP': false}
      };

      var quads = {
        name: 'VTM Quads',
        type: 'xyz',
        url: tileserver + '/vtmquads/{z}/{x}/{y}.png',
        visible: true
      };

      var quads_utfgrid = {
        name: 'VTM Quads UTFGrid',
        type: 'utfGrid',
        url: tileserver + '/vtmquads_utfgrid/{z}/{x}/{y}.json',
        visible: true,
        pluginOptions: { 'useJsonP': false}
      };

      var counties = {
        name: 'Counties',
        type: 'xyz',
        url: tileserver + '/counties/{z}/{x}/{y}.png',
        visible: false
      };

      var counties_utfgrid = {
        name: 'Counties UTFGrid',
        type: 'utfGrid',
        url: tileserver + '/counties_utfgrid/{z}/{x}/{y}.json',
        visible: true,
        pluginOptions: { 'useJsonP': false}
      };
      
    //public functions          
     return {
          loadGrayscale: function() {
               return grayscale;
          },
          loadVegPolygons: function() {
               return veg;
          },
          loadVegUTFgrid: function() {
               return veg_utfgrid;
          },
          loadPlotPoints: function() {
               return plots;
          },
          loadPlotUTFgrid: function() {
               return plots_utfgrid;
          },
          loadQuads: function() {
               return quads;
          },
          loadQuadUTFgrid: function() {
               return quads_utfgrid;
          },
          loadCounties: function() {
               return counties;
          },
          loadCountyUTFgrid: function() {
               return counties_utfgrid;
          }
     };

}])


;