/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/home`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */
angular.module( 'vtm.data', [
  'ui.router',
  'leaflet-directive'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
  $stateProvider
  .state( 'data', {
    abstract: true,
    url: '/data',
    views: {
      "main": {
        controller: 'DataCtrl',
        templateUrl: 'data/data.tpl.html'
      }
    },
    data:{ pageTitle: 'Data' }
  })
    .state( 'data.overview', {
      url: '/',
      templateUrl: 'data/data.overview.tpl.html'

    })
    .state( 'data.vegetation', {
      url: '/vegetation',
      templateUrl: 'data/data.vegetation.tpl.html'
    })
    .state( 'data.plots', {
      url: '/plots',
      templateUrl: 'data/data.plots.tpl.html'
    })
    .state( 'data.photos', {
      url: '/photos',
      templateUrl: 'data/data.photos.tpl.html'
    })
    .state( 'data.mapsheets', {
      url: '/mapsheets',
      templateUrl: 'data/data.mapsheets.tpl.html'
    })

  ;


})

/**
 * And of course we define a controller for our route.
 */
.controller( 'DataCtrl', function DataController($scope, $log, $http, leafletData) {

  // Map setup
  var center = {
    lat: 37,
    lng: -122,
    zoom: 10
  };

  var maxBounds = {
    southWest: {
      lat: 32.1,
      lng: -114.5
    },
    northEast: {
      lat: 42.55,
      lng: -125.0
    }
  };

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


  var vegetation = {
    name: 'Vegetation',
    type: 'xyz',
    url: 'https://dev-ecoengine.berkeley.edu/tiles/vtmveg/{z}/{x}/{y}.png',
    visible: true
  };

  var quads = {
    name: 'Quads',
    type: 'xyz',
    url: 'https://dev-ecoengine.berkeley.edu/tiles/vtmquads/{z}/{x}/{y}.png',
    visible: true
  };

  var counties = {
    name: 'Counties',
    type: 'xyz',
    url: 'https://dev-ecoengine.berkeley.edu/tiles/counties/{z}/{x}/{y}.png',
    visible: true
  };

  var geojsonLayer = {};

  angular.extend($scope, {
    center : center,
    maxBounds: maxBounds,
    layers: {
      baselayers: {
        grayscale: grayscale
      },
      overlays: {
        vegetation: vegetation,
        quads: quads,
        counties: counties
      }
    },
    defaults : {
      scrollWheelZoom: false
    }
  });

  //On map click event
  function style(feature) {
    return {
      weight: 7,
      opacity: 1,
      color: 'white',
      fillOpacity: 0
    };
  }
 

  $scope.$on('leafletDirectiveMap.click', function(event, args) {

    var url = 'https://dev-ecoengine.berkeley.edu/api/vtmveg/?g={"type":"point","coordinates":[' + args.leafletEvent.latlng.lng + ',' + args.leafletEvent.latlng.lat + ']}&format=geojson';
    
    //Get geojson feature for point clicked on map
    $http.get(url).success(function(data, status) {
      angular.extend($scope, {
        geojson: {
            data: data,
            style: style,
            resetStyleOnMouseout: false
        }
      });
      $scope.layerProp = $scope.geojson.data.features[0].properties;
      $log.log($scope.layerProp);

      //Get native leaflet map object
      leafletData.getMap('veg-map').then(function(map) {
        var latlngs = [];
        for (var i in $scope.geojson.data.features[0].geometry.coordinates) {
            var coord = $scope.geojson.data.features[0].geometry.coordinates[i];
            for (var j in coord) {
                latlngs.push(L.GeoJSON.coordsToLatLng(coord[j]));
            }
        }
        map.fitBounds(latlngs);
      });

    }); //end $http.get


  }); //end map click event

  //Download features click event
  $scope.downloadFeaturesJSON = function (){
    $log.log('download features button clicked');
  };

})
;