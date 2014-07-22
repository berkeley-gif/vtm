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
  'leaflet-directive',
  'filters.split'
])

/**
 * Defining the domain name as a constant
 */
.constant('ROOT', 'https://dev-ecoengine.berkeley.edu')

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
    controller: 'DataCtrl',
    templateUrl: 'data/data.tpl.html'
  })
  .state( 'data.overview', {
    url: '/',
    templateUrl: 'data/data.overview.tpl.html',
    data:{ pageTitle: 'Available Datasets' }
  })
  .state( 'data.plots', {
    url: '/plots',
    templateUrl: 'data/data.plots.tpl.html',
    controller: 'PlotsCtrl',
    data:{ pageTitle: 'Plot Data' }
  })
  .state( 'data.vegetation', {
    url: '/vegetation',
    templateUrl: 'data/data.vegetation.tpl.html',
    controller: 'VegCtrl',
    data:{ pageTitle: 'Vegetation Map' }
  })
  .state( 'data.photos', {
    url: '/photos',
    templateUrl: 'data/data.photos.tpl.html',
    data:{ pageTitle: 'Photo Locations' }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'DataCtrl', function DataController($scope, $log, $http, $state, leafletData, ROOT) {

  // API URL in Ecoengine
  //var tileserver  = 'https://dev-ecoengine.berkeley.edu/tiles';
  var tileserver  = 'http://localhost:8080';
  var fileserver = 'http://localhost:8000';

  // Map setup
  var center = {
    lat: 37,
    lng: -122,
    zoom: 11 
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

  var overlays =  {
    veg: veg,
    veg_utfgrid: veg_utfgrid,
    counties: counties,
    quads: quads,
    quads_utfgrid: quads_utfgrid,
    plots: plots,
    plots_utfgrid: plots_utfgrid
  };

  // Set up DownloadFeaturesControl
  var downloadFeaturesControl = L.control();
	downloadFeaturesControl.setPosition('bottomright');
	downloadFeaturesControl.onAdd = function (map) {
    var div = L.DomUtil.create('div','download-features');
    div.innerHTML = '<button type="button" class="btn btn-primary">Download features in view</button>';
    L.DomEvent
		.on(div, 'click', L.DomEvent.stopPropagation)
		.on(div, 'click', L.DomEvent.preventDefault)
		.on(div, 'click', function() {
			leafletData.getMap().then(function(map) {
				var url = ROOT + apiUrl + "/?bbox="+map.getBounds().toBBoxString()+"&format=geojson";
				//console.log("BBox: " + map.getBounds().toBBoxString());
				window.open(url);
			});
		})
		.on(div, 'dblclick', L.DomEvent.stopPropagation);
    return div;
  };

  // Putting all the map parameters together
  angular.extend($scope, {
    center : center,
    maxBounds: maxBounds,
    layers: {
      baselayers: {
        grayscale: grayscale
      },
      overlays: overlays
    },
    defaults : {
      scrollWheelZoom: true 
    },
	controls : {
      //custom: [ downloadFeaturesControl ]
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




  $scope.$on('leafletDirectiveMap.utfgridClick', function(event, leafletEvent) {
    
    var data = leafletEvent.data;

    if (data.hasOwnProperty('VTM_QUAD')) {
      $scope.vtm_quad_id = data.VTM_QUAD;
    } else if (data.hasOwnProperty('record')) {    
      $scope.$apply(function() {
         $scope.record = data.record;
      });
    } else {
      console.log('no data properties found');
    }

  });



})



/**
 * And of course we define a controller for our route.
 */
.controller( 'PlotsCtrl', function PlotsController($scope, $log, $http, $state, leafletData, ROOT) {



  $log.log('in data plots controller');

  $scope.layers.overlays.veg.visible = false;
  $scope.layers.overlays.veg_utfgrid.visible = false;
  $scope.layers.overlays.plots.visible = true;
  $scope.layers.overlays.plots_utfgrid.visible = true;

  $scope.$watch('record', function(newValue, oldValue){

    // Ignore initial setup
    if ( newValue === oldValue) {
      return;
    }

    // Load data from service
    if ( newValue ) {
      console.log($scope.record);
      var url = "https://dev-ecoengine.berkeley.edu/api/vtmplots/" + $scope.record + '/?format=json';
      $http.get(url).success(function(response, status) {

        //Highlight feature
        angular.extend($scope, {
          geojson: {
            data: response.geojson,
            resetStyleOnMouseout: false
          }
          
        });
        
        $log.log(response);

        $scope.layerProp = response;

      }); //end $http.get

    }

  }, true);

  

})

/**
 * And of course we define a controller for our route.
 */
.controller( 'VegCtrl', function VegetationController($scope, $log, $http, $state, leafletData, ROOT) {

  

  //On map click event
  function style(feature) {
    return {
      weight: 7,
      opacity: 1,
      color: 'white',
      fillOpacity: 0
    };
  }

  $log.log('in veg controller');

  

  $scope.layers.overlays.plots.visible = false;
  $scope.layers.overlays.plots_utfgrid.visible = false;
  $scope.layers.overlays.veg.visible = true;
  $scope.layers.overlays.veg_utfgrid.visible = true;

    $scope.$watch('record', function(newValue, oldValue){

    // Ignore initial setup
    if ( newValue === oldValue) {
      return;
    }

    // Load data from service
    if ( newValue ) {
      console.log($scope.record);
      var url = "https://dev-ecoengine.berkeley.edu/api/vtmveg/" + $scope.record + '/?format=json';
      $http.get(url).success(function(response, status) {

        //Highlight feature
        angular.extend($scope, {
          geojson: {
            data: response.geojson,
            style: style,
            resetStyleOnMouseout: false
          }
          
        });
        
        $log.log(response);

        $scope.layerProp = response;

      }); //end $http.get

    }

  }, true);

})


;