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
    templateUrl: 'data/data.tpl.html',
    data:{ pageTitle: 'Data' }
  })
  .state( 'data.overview', {
	url: '/',
    templateUrl: 'data/data.overview.tpl.html',
    data:{ pageTitle: 'Available Datasets' }
  })
  .state( 'data.vegetation', {
    url: '/vegetation',
    templateUrl: 'data/data.vegetation.tpl.html',
	controller: 'DataCtrl',
    data:{ 
      pageTitle: 'Vegetation Type Map',
      apiUrl: '/api/vtmveg'
	}
  })
  .state( 'data.plots', {
    url: '/plots',
    templateUrl: 'data/data.plots.tpl.html',
	controller: 'DataCtrl',
    data:{ 
      pageTitle: 'Plots Map',
      apiUrl: '/api/vtmplots'
	}
  })
  .state( 'data.photos', {
    url: '/photos',
    templateUrl: 'data/data.photos.tpl.html',
    data:{ pageTitle: 'Photos Map' }
  })
  .state( 'data.mapsheets', {
    url: '/mapsheets',
    templateUrl: 'data/data.mapsheets.tpl.html',
    data:{ pageTitle: 'Mapsheets' }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'DataCtrl', function DataController($scope, $log, $http, $state, leafletData, ROOT) {

  // API URL in Ecoengine
  var apiUrl  = $state.current.data.apiUrl;

  // Map setup
  var center = {
    lat: 37,
    lng: -122,
    zoom: 6 
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
    name: 'Plots',
    type: 'xyz',
    url: ROOT + '/tiles/vtmplots/{z}/{x}/{y}.png',
    visible: true
  };

  var vegetation = {
    name: 'Vegetation',
    type: 'xyz',
    url: ROOT + '/tiles/vtmveg/{z}/{x}/{y}.png',
    visible: true
  };

  var quads = {
    name: 'Quads',
    type: 'xyz',
    url: ROOT + '/tiles/vtmquads/{z}/{x}/{y}.png',
    visible: true
  };

  var counties = {
    name: 'Counties',
    type: 'xyz',
    url: ROOT + '/tiles/counties/{z}/{x}/{y}.png',
    visible: false
  };

  var overlays =  {
	vegetation: vegetation,
	quads: quads,
	counties: counties,
	plots: plots
  };

  // Remove plot layer when it's in the vegetation type map page 
  if (apiUrl == '/api/vtmveg') {
    delete overlays.plots;
  }

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
      custom: [ downloadFeaturesControl ]
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

	// Construct query url
	var url;
	if (apiUrl == '/api/vtmveg') {
		url = ROOT + apiUrl + '/?g={"type":"point","coordinates":[' + args.leafletEvent.latlng.lng + ',' + args.leafletEvent.latlng.lat + ']}&format=geojson';
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
			//$log.log($scope.layerProp);

			//Get native leaflet map object
			leafletData.getMap('map').then(function(map) {
				var latlngs = [];
				for (var i in $scope.geojson.data.features[0].geometry.coordinates) {
					var coord = $scope.geojson.data.features[0].geometry.coordinates[i];
					for (var j in coord) {
						latlngs.push(L.GeoJSON.coordsToLatLng(coord[j]));
					}
				}
				map.fitBounds(latlngs, {maxZoom:13});
			});
		}); //end $http.get
	} else {
		// Create a bounding box around the clicked point.
		var BUFFER = 0.001;
		var cor1 = { lng: args.leafletEvent.latlng.lng-BUFFER, lat: args.leafletEvent.latlng.lat+BUFFER };
		var cor2 = { lng: args.leafletEvent.latlng.lng-BUFFER, lat: args.leafletEvent.latlng.lat-BUFFER };
		var cor3 = { lng: args.leafletEvent.latlng.lng+BUFFER, lat: args.leafletEvent.latlng.lat-BUFFER };
		var cor4 = { lng: args.leafletEvent.latlng.lng+BUFFER, lat: args.leafletEvent.latlng.lat+BUFFER };
	
		url = ROOT + apiUrl + '/?g={"type":"polygon","coordinates":[['+
				'['+cor1.lng+','+cor1.lat+'],'+ '['+cor2.lng+','+cor2.lat+'],'+
				'['+cor3.lng+','+cor3.lat+'],'+ '['+cor4.lng+','+cor4.lat+'],'+
				'['+cor1.lng+','+cor1.lat+'],'+ ']]}&format=geojson';
	
		//Get geojson feature for point clicked on map
		$http.get(url).success(function(data, status) {
			angular.extend($scope, {
				geojson: {
					data: data,
					style: style,
					resetStyleOnMouseout: false
				}
			});
			//$log.log($scope.geojson.data);
			if (data.count > 0) { 
				$scope.layerProp = $scope.geojson.data.features[0].properties;
			}
		}); //end $http.get
	}

  }); //end map click event

});
