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
  'filters.split',
  'services.VtmTileService',
  'restangular'
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
    data:{ pageTitle: 'Vegetation' }
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
.controller( 'DataCtrl', function DataController($scope, $log, $http, $state, leafletData, VtmTiles) {

  // Map setup
  var center = {
    lat: 37.5,
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

  //Load tiles from service
  var overlays =  {
    veg: VtmTiles.loadLayer('veg'),
    veg_utfgrid: VtmTiles.loadLayer('veg_utfgrid'),
    counties: VtmTiles.loadLayer('counties'),
    counties_utfgrid: VtmTiles.loadLayer('counties_utfgrid'),
    quads: VtmTiles.loadLayer('quads'),
    quads_utfgrid: VtmTiles.loadLayer('quads_utfgrid'),
    plots: VtmTiles.loadLayer('plots'),
    plots_utfgrid: VtmTiles.loadLayer('plots_utfgrid')
  };

  //Define custom controls  
  var downloadFeaturesControl = L.control(); // DownloadFeaturesControl
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

  var toggleVegControl = L.control(); // DownloadFeaturesControl
  toggleVegControl.setPosition('bottomleft');
  toggleVegControl.onAdd = function (map) {
    var div = L.DomUtil.create('div','custom-control leaflet-bar');
    div.innerHTML = '<a href="" class="toggle-veg" title="Vegetation Show/Hide"><i class="fa fa-leaf"></i></a>';
    L.DomEvent
    .on(div, 'click', L.DomEvent.stopPropagation)
    .on(div, 'click', L.DomEvent.preventDefault)
    .on(div, 'click', function() {
      VtmTiles.toggleLayer('veg');
      VtmTiles.toggleLayer('veg_utfgrid');
    })
    .on(div, 'dblclick', L.DomEvent.stopPropagation);
    return div;
  };

  var togglePlotsControl = L.control(); // DownloadFeaturesControl
  togglePlotsControl.setPosition('bottomleft');
  togglePlotsControl.onAdd = function (map) {
    var div = L.DomUtil.create('div','custom-control leaflet-bar');
    div.innerHTML = '<a href="" class="toggle-plots" title="Plots Show/Hide"><i class="fa fa-circle"></i></a>';
    L.DomEvent
    .on(div, 'click', L.DomEvent.stopPropagation)
    .on(div, 'click', L.DomEvent.preventDefault)
    .on(div, 'click', function() {
      VtmTiles.toggleLayer('plots');
      VtmTiles.toggleLayer('plots_utfgrid');
    })
    .on(div, 'dblclick', L.DomEvent.stopPropagation);
    return div;
  };

  var togglePhotosControl = L.control(); // DownloadFeaturesControl
  togglePhotosControl.setPosition('bottomleft');
  togglePhotosControl.onAdd = function (map) {
    var div = L.DomUtil.create('div','custom-control leaflet-bar');
    div.innerHTML = '<a href="" class="toggle-photos" title="Photos Show/Hide"><i class="fa fa-picture-o"></i></a>';
    L.DomEvent
    .on(div, 'click', L.DomEvent.stopPropagation)
    .on(div, 'click', L.DomEvent.preventDefault)
    .on(div, 'click', function() {
      //VtmTiles.toggleLayer('photos');
      //VtmTiles.toggleLayer('photos_utfgrid');
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
        grayscale: VtmTiles.loadLayer('grayscale')
      },
      overlays: overlays
    },
    defaults : {
      minZoom: 6,
      scrollWheelZoom: false
    },
    controls : {
        custom: [ toggleVegControl, togglePlotsControl, togglePhotosControl]
    }
  });



  $scope.$on('leafletDirectiveMap.utfgridClick', function(event, leafletEvent) {
    
    var data = leafletEvent.data;
/*    console.log('event', event);
    console.log(leafletEvent);*/

    if (data) {

      if (data.hasOwnProperty('VTM_QUAD')) {
        $scope.vtm_quad_id = data.VTM_QUAD;
      }

      if (data.hasOwnProperty('NAME')) {
        $scope.county_name = data.NAME;
      }

      if (data.hasOwnProperty('record')) {    
        var record = data.record;
        if (record.search('plot') >= 0) {
          $scope.$apply(function() {
            $scope.plotRecord = record;
          });
        } else {
          $scope.$apply(function() {
            $scope.vegRecord = record;
          });
        }

      }

    }



  });

  $scope.showAttribution = false;
  $scope.mapAttributionText = 'Data provided by <a href="http://openstreetmap.org" target="_blank">' +
                              ' HOLOS</a> Berkeley Ecoinformatics Engine. Basemap data by &copy;' +
                              ' <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>' +
                              ' contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">' +
                              ' CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com" target="_blank">Mapbox</a>';



})



/**
 * And of course we define a controller for our route.
 */
.controller( 'PlotsCtrl', function PlotsController($scope, $log, $http, $state, leafletData, VtmTiles, Restangular) {



  $log.log('in plots controller');

  //Make all overlays except plots invisible
  VtmTiles.showLayer('plots');
  VtmTiles.showLayer('plots_utfgrid');
  VtmTiles.hideLayer('veg');
  VtmTiles.hideLayer('veg_utfgrid');
  //VtmTiles.hideLayer('photos');
  //VtmTiles.hideLayer('photos_utfgrid');


  $scope.$watch('plotRecord', function(newValue, oldValue){

    // Ignore initial setup
    if ( newValue === oldValue) {
      return;
    }

    // Load data from service
    if ( newValue ) {

      var plotRecord = Restangular.one('vtmplots', newValue);
      plotRecord.get().then(function(response) {
        $scope.layerProp = response.plain(); //Strip out Restangular methods
        $scope.layerQueried = 'vtmplots';
        $log.log($scope.layerProp);
        //Highlight feature
        angular.extend($scope, {
          geojson: {
            data: response.geojson,
            resetStyleOnMouseout: false
          }
          
        });
      });



    }

  }, true);

  

})

/**
 * And of course we define a controller for our route.
 */
.controller( 'VegCtrl', function VegController($scope, $log, $http, $state, leafletData, Restangular, VtmTiles) {



  $log.log('in veg controller');
  //Make all overlays except vegetation invisible
  VtmTiles.showLayer('veg');
  VtmTiles.showLayer('veg_utfgrid');
  VtmTiles.hideLayer('plots');
  VtmTiles.hideLayer('plots_utfgrid');
  //VtmTiles.hideLayer('photos');
  //VtmTiles.hideLayer('photos_utfgrid');


  //Style for selected veg polygon on click event
  function style(feature) {
    return {
      weight: 4,
      opacity: 1,
      color: 'white',
      fillOpacity: 0
    };
  }


  $scope.$watch('vegRecord', function(newValue, oldValue){

    // Ignore initial setup
    if ( newValue === oldValue) {
      return;
    }

    // Load data from service
    if ( newValue ) {

      var vegRecord = Restangular.one('vtmveg', newValue);
      vegRecord.get().then(function(response) {
        $scope.layerProp = response.plain(); //Strip out Restangular methods
        $log.log($scope.layerProp);
        //Highlight feature
        angular.extend($scope, {
          geojson: {
            data: response.geojson,
            style: style,
            resetStyleOnMouseout: false
          }
          
        });
      });



    }

  }, true);

  

})

;