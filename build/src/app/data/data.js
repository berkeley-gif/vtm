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
  'services.HolosPaginatedResource'
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
.controller( 'DataCtrl', function DataController($scope, $log, $http, $state, $timeout, leafletData, leafletBoundsHelpers, VtmLayers, VtmPhotos, Restangular) {

  // Map setup
  console.log('state', $state);
  var center = {
    lat: 37.5,
    lng: -122,
    zoom: 11 
  };

  var bounds = leafletBoundsHelpers.createBoundsFromArray([
    [ center.lat-0.1, center.lng-0.1 ],
    [ center.lat+0.1, center.lng+0.1 ]
  ]);
  console.log('bounds before map', bounds);

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
    veg_utfgrid: VtmLayers.loadLayer('veg_utfgrid'),
    counties: VtmLayers.loadLayer('counties'),
    counties_utfgrid: VtmLayers.loadLayer('counties_utfgrid'),
    quads: VtmLayers.loadLayer('quads'),
    quads_utfgrid: VtmLayers.loadLayer('quads_utfgrid'),
    plots: VtmLayers.loadLayer('plots'),
    //plots_utfgrid: VtmLayers.loadLayer('plots_utfgrid'),
    photos: VtmLayers.loadLayer('photos')     //marker group layer
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
    var div = L.DomUtil.create('div','custom-control');
    div.innerHTML = '<a href="" class="toggle-veg" title="Vegetation Show/Hide"><i class="fa fa-leaf"></i></a>';
    L.DomEvent
    .on(div, 'click', L.DomEvent.stopPropagation)
    .on(div, 'click', L.DomEvent.preventDefault)
    .on(div, 'click', function() {
      toggleLayer('veg');
    })
    .on(div, 'dblclick', L.DomEvent.stopPropagation);
    return div;
  };

  var togglePlotsControl = L.control(); // DownloadFeaturesControl
  togglePlotsControl.setPosition('bottomleft');
  togglePlotsControl.onAdd = function (map) {
    var div = L.DomUtil.create('div','custom-control');
    div.innerHTML = '<a href="" class="toggle-plots" title="Plots Show/Hide"><i class="fa fa-circle"></i></a>';
    L.DomEvent
    .on(div, 'click', L.DomEvent.stopPropagation)
    .on(div, 'click', L.DomEvent.preventDefault)
    .on(div, 'click', function() {
      toggleLayer('plots');
    })
    .on(div, 'dblclick', L.DomEvent.stopPropagation);
    return div;
  };

  var togglePhotosControl = L.control(); // DownloadFeaturesControl
  togglePhotosControl.setPosition('bottomleft');
  togglePhotosControl.onAdd = function (map) {
    var div = L.DomUtil.create('div','custom-control');
    div.innerHTML = '<a href="" class="toggle-photos" title="Photos Show/Hide"><i class="fa fa-camera"></i></a>';
    L.DomEvent
    .on(div, 'click', L.DomEvent.stopPropagation)
    .on(div, 'click', L.DomEvent.preventDefault)
    .on(div, 'click', function() {
      toggleLayer('photos');
    })
    .on(div, 'dblclick', L.DomEvent.stopPropagation);
    return div;
  };

  // Putting all the map parameters together
  angular.extend($scope, {
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
        doubleClickZoom: false,
        contextmenu: true,
        contextmenuItems: [
          {
            text: 'County'
          },
          {
            text: 'VTM Quad',
            callback: queryVTMQuads
          }, '-',
          {
            text: 'Plot',
            //callback: zoomIn
            disabled: true
          },
          {
            text: 'Vegetation'
            //callback: zoomOut
          },
          {
            text: 'Photo'
            //callback: zoomOut
          }
        ]
      }
    },
    controls : {
        custom: [ toggleVegControl, togglePlotsControl, togglePhotosControl]
    }
  });

  function queryVTMQuads(args){

    var latlng = args.latlng;

    var latlngBounds = leafletBoundsHelpers.createBoundsFromArray([
      [ latlng.lat-0.002, latlng.lng-0.002 ],
      [ latlng.lat+0.002, latlng.lng+0.002 ]
    ]);
    var southWest = latlngBounds.southWest;
    var northEast = latlngBounds.northEast;
    
    var bboxString = southWest.lng + ',' + southWest.lat + ',' + northEast.lng + ',' + northEast.lat;
    
    console.log('map click event', bboxString);

    var vtmquads = Restangular.one('layers', 'vtmquads');

    vtmquads.getList('features', {bbox: bboxString}).then(function(data){
      console.log('from map click', data);
    });

  }

  function loadPhotoMarkers(bboxString){
    console.log("BBox: " + bboxString);
    $scope.markers = VtmPhotos.loadMarkers({'bbox': bboxString});
    console.log('markersfrom data', $scope.markers);
  }

  $scope.$on('leafletDirectiveMap.moveend', function(){

    leafletData.getMap().then(function(leafletMapObject) {
      var bboxString = leafletMapObject.getBounds().toBBoxString();
      var bboxArray = bboxString.split(',').map(function(val){
        return (parseFloat(val)).toFixed(4);
      });
      loadPhotoMarkers(bboxArray.toString());
    });

  });


  function toggleLayer(layername) {

      $scope.$apply(function() {
        VtmLayers.toggleLayer(layername);
        console.log($scope.defaults.map.contextmenuItems);
      });   

  }


/*  $scope.$on('leafletDirectiveMap.utfgridClick', function(event, leafletEvent) {
    
    var data = leafletEvent.data;

    if (data) {

      if (data.hasOwnProperty('VTM_QUAD')) {
        $scope.vtm_quad_id = data.VTM_QUAD;
      }

      if (data.hasOwnProperty('NAME')) {
        $scope.county_name = data.NAME;
      }

      if (data.hasOwnProperty('record')) {    
        var record = data.record;
        console.log(record);
        if (record.search('plot') >= 0) {
          $scope.$apply(function() {
            $scope.plotRecord = record;
            console.log('record clicked', record);
          });
        }
        else if (record.search('Photo') >= 0) {
          $scope.$apply(function() {
            $scope.photoRecord = record;
          });
        } 
        else {
          $scope.$apply(function() {
            $scope.vegRecord = record;
          });
        }

      }

    }



  });*/

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
.controller( 'PlotsCtrl', function PlotsController($scope, $log, $http, $state, leafletData, VtmLayers, VtmPhotos, Restangular) {



  $log.log('in plots controller');

  //Make all overlays except plots invisible
  VtmLayers.showLayer('plots');
  VtmLayers.hideLayer('veg');
  VtmLayers.hideLayer('photos');

  

})

/**
 * And of course we define a controller for our route.
 */
.controller( 'VegCtrl', function VegController($scope, $log, $http, $state, leafletData, Restangular, VtmLayers) {



  $log.log('in veg controller');
  //Make all overlays except vegetation invisible
  VtmLayers.showLayer('veg');
  VtmLayers.hideLayer('plots');
  VtmPhotos.hideLayer('photos');


  //Style for selected veg polygon on click event
  function style(feature) {
    return {
      weight: 4,
      opacity: 1,
      color: 'white',
      fillOpacity: 0
    };
  }


  /*$scope.$watch('vegRecord', function(newValue, oldValue){

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
*/
  

})

.controller( 'PhotosCtrl', function PhotosController($scope, $log, $http, $state, leafletData, VtmLayers, Restangular) {



  $log.log('in photos controller');

  //Make all overlays except photos invisible
  VtmPhotos.showLayer('photos');
  VtmLayers.hideLayer('veg');
  VtmLayers.hideLayer('plots');


  /*$scope.$watch('photoRecord', function(newValue, oldValue){

    // Ignore initial setup
    if ( newValue === oldValue) {
      return;
    }

    // Load data from service
    if ( newValue ) {
      var photoRecord = Restangular.one('photos', newValue);
      photoRecord.get().then(function(response) {
        $scope.layerProp = response.plain(); //Strip out Restangular methods
        $scope.layerQueried = 'photos';
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

  }, true);*/

  

})

;