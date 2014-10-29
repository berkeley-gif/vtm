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
  'services.VtmLayerService',
  'restangular',
  'services.VtmPhotoService',
  'directives.customLayerControl',
  'directives.repeatDelimiter',
  'directives.customLegendControl',
  'filters.thumbnail',
  'directives.resizableImage',
  'services.VtmPlotsService',
  'services.debounce'
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
    controller: 'PhotosCtrl',
    data:{ pageTitle: 'Photo Locations' }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'DataCtrl', function DataController($scope, $log, $http, $state, $timeout, $debounce, $modal, leafletData, leafletBoundsHelpers, VtmLayers, VtmPhotos, VtmPlots, Restangular) {

  // Map setup
  var center = {
    lat: 37.5,
    lng: -122,
    zoom: 11 
  };

  var bounds = leafletBoundsHelpers.createBoundsFromArray([
    [ center.lat-0.1, center.lng-0.1 ],
    [ center.lat+0.1, center.lng+0.1 ]
  ]);

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
    veg: VtmLayers.loadLayer('veg'),
    quads: VtmLayers.loadLayer('quads'),
    plots: VtmLayers.loadLayer('plots'), //marker group layer
    photos: VtmLayers.loadLayer('photos')    //marker group layer
  };

  
  // Putting all the map parameters together
  angular.extend($scope, {
    map : {
      bounds: bounds,
      maxBounds: maxBounds,
      layers: {
        baselayers: {
          grayscale: VtmLayers.loadLayer('grayscale')
        },
        overlays: overlays
      },
      defaults : {
        map: {
          minZoom: 6,
          scrollWheelZoom: false,
          doubleClickZoom: false
        }
      },
      controls : {
          custom: []
      }
    }

  });

  $scope.results = {
    counties : [],
    quads : [],
    plots: [],
    photos: [],
    veg: []
  };

/*  $scope.$on('leafletDirectiveMap.moveend', function(){
    leafletData.getMap().then(function(leafletMapObject) {
      var bboxString = leafletMapObject.getBounds().toBBoxString();
      var bboxArray = bboxString.split(',').map(function(val){
        return (parseFloat(val)).toFixed(4);
      });
      loadMarkers(bboxArray.toString());
    });
  });*/

  $scope.$watch('map.bounds', function(newValue, oldValue){

    if ( newValue !== oldValue ) {
      // Only increment the counter if the value changed
      leafletData.getMap().then(function(leafletMapObject) {
        var bboxString = leafletMapObject.getBounds().toBBoxString();
        var bboxArray = bboxString.split(',').map(function(val){
          return (parseFloat(val)).toFixed(4);
        });
        loadMarkers(bboxArray.toString());
      });
    }

  }, true);


  $scope.$on('leafletDirectiveMap.click', function(e, args) {
    $scope.results['photos'].length = 0;
    $scope.results['plots'].length = 0;
    queryFeatures(args.leafletEvent.latlng);
  });

  $scope.$on('leafletDirectiveMarker.click', function(e, args) {
    var temp_marker = $scope.map.markers[args.markerName];
    $scope.results['plots'].length = 0;
    $scope.results['photos'].length = 0;
    if (temp_marker.layer == 'plots') {
      $scope.results['plots'].push(temp_marker);
    } else {
      $scope.results['photos'].push(temp_marker);
    }  
    queryFeatures(args.leafletEvent.latlng);
  });

  function queryFeatures(latlng){
    
    //Create geojson geometry string fpr query
    var pointGeojson = 
      { 
        'type' : 'Point',
        'coordinates' : [latlng.lng, latlng.lat]
      };

    ////Create bounding box for query
    var latlngBounds = leafletBoundsHelpers.createBoundsFromArray([
      [ latlng.lat+0.002, latlng.lng+0.002 ],
      [ latlng.lat-0.002, latlng.lng-0.002 ]
    ]);

    var southWest = latlngBounds.southWest;
    var northEast = latlngBounds.northEast;  

  
    var bboxString = southWest.lng.toFixed(4) + ',' + southWest.lat.toFixed(4) + ',' + northEast.lng.toFixed(2) + ',' + northEast.lat.toFixed(2);

    var counties = Restangular.one('layers', 'cacounties');
    counties.getList('features', {bbox: bboxString, fields: 'name'}).then(function(data){
      if (data.results.length > 0){
        $scope.results['counties'].length = 0;
        $scope.results['counties'] = data.results;
      }
    });

    var vtmquads = Restangular.one('layers', 'vtmquads');
    vtmquads.getList('features', {bbox: bboxString, fields: 'name'}).then(function(data){
      if (data.results.length > 0){
        $scope.results['quads'].length = 0;
        $scope.results['quads'] = data.results;
      }
    });

    if ( VtmLayers.isVisible('veg') ) {
      var vtmveg = Restangular.all('vtmveg');
      vtmveg.getList({g: pointGeojson}).then(function(data){
        if (data.results.length > 0){
          $scope.results['veg'].length = 0;
          $scope.results['veg'] = data.results;
        }
      });
    } else {
      $scope.results['veg'].length = 0;
    }

    console.log($scope.results);

  }

  var photoMarkers = [];
  var plotMarkers = [];
  function loadMarkers(bboxString){
    VtmPhotos.loadMarkers({'bbox': bboxString});
    VtmPlots.loadMarkers({'bbox': bboxString});
    photoMarkers = VtmPhotos.getMarkers();
    plotMarkers = VtmPlots.getMarkers();
    $debounce(updateMarkers, 1000);
    
  }

  function updateMarkers(){

    $scope.map.markers = photoMarkers.concat(plotMarkers);
    console.log(photoMarkers.length, plotMarkers.length, $scope.map.markers);
    $scope.$apply();
  }


  //////////////////////////////////////////////////////////////////
  //  EVENT HANDLERS FOR DETAIL STATE WHEN IT IS OPENED AS MODAL  //
  /////////////////////////////////////////////////////////////////

  $scope.showAttribution = false;
  $scope.mapAttributionText = 'VTM data provided by <a href="http://openstreetmap.org" target="_blank">' +
                              ' HOLOS</a> Berkeley Ecoinformatics Engine. Basemap data by &copy;' +
                              ' <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>' +
                              ' contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">' +
                              ' CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com" target="_blank">Mapbox</a>';


})



/**
 * And of course we define a controller for our route.
 */
.controller( 'PlotsCtrl', function PlotsController($scope, $log, VtmLayers, VtmPhotos) {

  //Make all overlays except plots invisible
  VtmLayers.showLayer('plots');
  VtmLayers.hideLayer('veg');
  VtmLayers.hideLayer('photos');


})

/**
 * And of course we define a controller for our route.
 */
.controller( 'VegCtrl', function VegController($scope, $log, VtmLayers) {

  //Make all overlays except vegetation invisible
  VtmLayers.showLayer('veg');
  VtmLayers.hideLayer('plots');
  VtmLayers.hideLayer('photos');

})

.controller( 'PhotosCtrl', function PhotosController($scope, $log, VtmLayers) {

  //Make all overlays except photos invisible
  VtmLayers.showLayer('photos');
  VtmLayers.hideLayer('veg');
  VtmLayers.hideLayer('plots');

})

;