/**
 * vtm - v0.0.1 - 2015-12-15
 * https://vtm.berkeley.edu
 *
 * Copyright (c) 2015 Berkeley GIF
 */
(function ( window, angular, undefined ) {

angular.module('vtm.about', [
  'filters.split',
  'ui.bootstrap'
]).config([
  '$stateProvider',
  function config($stateProvider) {
    $stateProvider.state('about', {
      abstract: true,
      url: '/about',
      controller: 'AboutCtrl',
      templateUrl: 'about/about.tpl.html'
    }).state('about.overview', {
      url: '/',
      templateUrl: 'about/about.overview.tpl.html',
      data: { pageTitle: 'History' }
    }).state('about.description', {
      url: '/description',
      templateUrl: 'about/about.description.tpl.html',
      data: { pageTitle: 'Data Description' }
    }).state('about.metadata', {
      url: '/metadata',
      templateUrl: 'about/about.metadata.tpl.html',
      data: { pageTitle: 'Metadata' }
    }).state('about.plotdata', {
      url: '/plotdata',
      templateUrl: 'about/about.plotdata.tpl.html',
      data: { pageTitle: 'Plot Data' }
    }).state('about.plotmaps', {
      url: '/plotmaps',
      templateUrl: 'about/about.plotmaps.tpl.html',
      data: { pageTitle: 'Plot Maps' }
    }).state('about.faq', {
      url: '/faq',
      templateUrl: 'about/about.faq.tpl.html',
      data: { pageTitle: 'Frequently Asked Questions' }
    }).state('about.bibliography', {
      url: '/bibliography',
      templateUrl: 'about/about.bibliography.tpl.html',
      data: { pageTitle: 'Wieslander Bibliography' }
    }).state('about.citations', {
      url: '/citations',
      templateUrl: 'about/about.citations.tpl.html',
      data: { pageTitle: 'Suggested Citations' }
    });
  }
]).controller('AboutCtrl', [
  '$scope',
  function AboutCtrl($scope) {
    $scope.status = { open: false };
  }
]);
;
angular.module('holos.config', []).constant('ENV', {
  name: 'production',
  apiEndpoint: 'https://ecoengine.berkeley.edu'
});
;
angular.module('vtm', [
  'templates-app',
  'templates-common',
  'vtm.home',
  'vtm.about',
  'vtm.data',
  'vtm.howto',
  'ui.router',
  'ngAnimate',
  'djds4rce.angular-socialshare',
  'holos.config'
]).config([
  '$stateProvider',
  '$urlRouterProvider',
  'RestangularProvider',
  'ENV',
  function myAppConfig($stateProvider, $urlRouterProvider, RestangularProvider, ENV) {
    $urlRouterProvider.otherwise('/home');
    RestangularProvider.setBaseUrl(ENV.apiEndpoint + '/api');
    RestangularProvider.setDefaultRequestParams({});
    RestangularProvider.setRequestSuffix('/');
    RestangularProvider.addResponseInterceptor(function (element, operation, what, url, response, deferred) {
      var extractedData = [];
      if (operation === 'getList') {
        extractedData.results = element.features ? element.features : element.results;
        extractedData.count = element.count;
        extractedData.next = element.next;
        extractedData.prev = element.prev;
      } else {
        extractedData = element;
      }
      return extractedData;
    });
    RestangularProvider.setErrorInterceptor(function (response, deferred, responseHandler) {
      if (response.status == 400) {
        console.log('The request had bad syntax or was inherently impossible to be satisfied.');
      } else if (response.status == 404) {
        console.log('Resource not available...');
      } else {
        console.log('Response received with HTTP error code: ' + response.status);
      }
      return false;
    });
  }
]).run([
  '$rootScope',
  '$location',
  '$window',
  function ($rootScope, $location, $window) {
    $rootScope.$on('$stateChangeSuccess', function (event) {
      if (!$window.ga) {
        return;
      }
      $window.ga('send', 'pageview', { page: $location.path() });
    });
  }
]).controller('AppCtrl', [
  '$scope',
  '$location',
  function AppCtrl($scope, $location) {
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      if (angular.isDefined(toState.data.pageTitle)) {
        $scope.pageTitle = toState.data.pageTitle + ' | VTM';
      }
    });
    $scope.socialShare = ' #vtm The most ambitious attempt ever made to describe the complex vegetation of CA';
  }
]);
angular.module('vtm.data', [
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
]).config([
  '$stateProvider',
  function config($stateProvider) {
    $stateProvider.state('data', {
      abstract: true,
      url: '/data',
      controller: 'DataCtrl',
      templateUrl: 'data/data.tpl.html'
    }).state('data.overview', {
      url: '/',
      templateUrl: 'data/data.overview.tpl.html',
      data: { pageTitle: 'Available Datasets' }
    }).state('data.plots', {
      url: '/plots',
      templateUrl: 'data/data.plots.tpl.html',
      controller: 'PlotsCtrl',
      data: { pageTitle: 'Plot Data' }
    }).state('data.vegetation', {
      url: '/vegetation',
      templateUrl: 'data/data.vegetation.tpl.html',
      controller: 'VegCtrl',
      data: { pageTitle: 'Vegetation' }
    }).state('data.photos', {
      url: '/photos',
      templateUrl: 'data/data.photos.tpl.html',
      controller: 'PhotosCtrl',
      data: { pageTitle: 'Photo Locations' }
    });
  }
]).controller('DataCtrl', [
  '$scope',
  '$log',
  '$http',
  '$state',
  '$timeout',
  '$debounce',
  '$modal',
  'leafletData',
  'leafletBoundsHelpers',
  'VtmLayers',
  'VtmPhotos',
  'VtmPlots',
  'Restangular',
  function DataController($scope, $log, $http, $state, $timeout, $debounce, $modal, leafletData, leafletBoundsHelpers, VtmLayers, VtmPhotos, VtmPlots, Restangular) {
    var center = {
        lat: 37.5,
        lng: -122,
        zoom: 11
      };
    var bounds = leafletBoundsHelpers.createBoundsFromArray([
        [
          center.lat - 0.1,
          center.lng - 0.1
        ],
        [
          center.lat + 0.1,
          center.lng + 0.1
        ]
      ]);
    var maxBounds = {
        southWest: {
          lat: 32.1,
          lng: -114.5
        },
        northEast: {
          lat: 42.55,
          lng: -125
        }
      };
    var overlays = {
        veg: VtmLayers.loadLayer('veg'),
        quads: VtmLayers.loadLayer('quads'),
        plots: VtmLayers.loadLayer('plots'),
        photos: VtmLayers.loadLayer('photos')
      };
    angular.extend($scope, {
      map: {
        bounds: bounds,
        maxBounds: maxBounds,
        layers: {
          baselayers: { grayscale: VtmLayers.loadLayer('grayscale') },
          overlays: overlays
        },
        defaults: {
          map: {
            minZoom: 6,
            scrollWheelZoom: false,
            doubleClickZoom: false
          }
        },
        controls: { custom: [] }
      }
    });
    $scope.results = {
      counties: [],
      quads: [],
      plots: [],
      photos: [],
      veg: []
    };
    $scope.$watch('map.bounds', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        $debounce(loadMarkers, 500);
      }
    }, true);
    $scope.$on('leafletDirectiveMap.click', function (e, args) {
      $scope.results.photos.length = 0;
      $scope.results.plots.length = 0;
      queryFeatures(args.leafletEvent.latlng);
    });
    $scope.$on('leafletDirectiveMarker.click', function (e, args) {
      var temp_marker = $scope.map.markers[args.markerName];
      $scope.results.plots.length = 0;
      $scope.results.photos.length = 0;
      if (temp_marker.layer == 'photos') {
        $scope.results.photos.push(temp_marker);
      } else {
      }
      queryFeatures(args.leafletEvent.latlng);
    });
    function queryFeatures(latlng) {
      var pointGeojson = {
          'type': 'Point',
          'coordinates': [
            latlng.lng,
            latlng.lat
          ]
        };
      var latlngBounds = L.latLngBounds([
          [
            latlng.lat + 0.002,
            latlng.lng + 0.002
          ],
          [
            latlng.lat - 0.002,
            latlng.lng - 0.002
          ]
        ]);
      var bboxString = latlngBounds.toBBoxString();
      var counties = Restangular.one('layers', 'cacounties');
      counties.getList('features', {
        bbox: bboxString,
        fields: 'name'
      }).then(function (data) {
        if (data.results.length > 0) {
          $scope.results.counties.length = 0;
          $scope.results.counties = data.results;
        }
      });
      var vtmquads = Restangular.one('layers', 'vtmquads');
      vtmquads.getList('features', {
        bbox: bboxString,
        fields: 'name'
      }).then(function (data) {
        if (data.results.length > 0) {
          $scope.results.quads.length = 0;
          $scope.results.quads = data.results;
        }
      });
      if (VtmLayers.isVisible('veg')) {
        var vtmveg = Restangular.all('vtmveg');
        vtmveg.getList({ g: pointGeojson }).then(function (data) {
          if (data.results.length > 0) {
            $scope.results.veg.length = 0;
            $scope.results.veg = data.results;
          }
        });
      } else {
        $scope.results.veg.length = 0;
      }
      if (VtmLayers.isVisible('plots')) {
        var vtmplots = Restangular.all('vtmplots');
        vtmplots.getList({
          bbox: bboxString,
          fields: 'plot_no,url'
        }).then(function (data) {
          if (data.results.length > 0) {
            $scope.results.plots.length = 0;
            $scope.results.plots = data.results;
          }
        });
      } else {
        $scope.results.veg.length = 0;
      }
    }
    var photoMarkers = [];
    function loadMarkers() {
      if (!$scope.map.markers) {
        $scope.map.markers = [];
      } else {
        $scope.map.markers.length = 0;
      }
      leafletData.getMap().then(function (leafletMapObject) {
        var bboxString = leafletMapObject.getBounds().toBBoxString();
        VtmPhotos.loadMarkers({ 'bbox': bboxString }).then(function (data) {
          console.log('successful in gettting photo markers');
          $scope.map.markers = $scope.map.markers.concat(data);
        });
      });
    }
    $scope.showAttribution = false;
    $scope.mapAttributionText = 'VTM data provided by <a href="http://openstreetmap.org" target="_blank">' + ' HOLOS</a> Berkeley Ecoinformatics Engine. Basemap data by &copy;' + ' <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>' + ' contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">' + ' CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com" target="_blank">Mapbox</a>';
  }
]).controller('PlotsCtrl', [
  '$scope',
  '$log',
  'VtmLayers',
  'VtmPhotos',
  function PlotsController($scope, $log, VtmLayers, VtmPhotos) {
    VtmLayers.showLayer('plots');
    VtmLayers.hideLayer('veg');
    VtmLayers.hideLayer('photos');
  }
]).controller('VegCtrl', [
  '$scope',
  '$log',
  'VtmLayers',
  function VegController($scope, $log, VtmLayers) {
    VtmLayers.showLayer('veg');
    VtmLayers.hideLayer('plots');
    VtmLayers.hideLayer('photos');
  }
]).controller('PhotosCtrl', [
  '$scope',
  '$log',
  'VtmLayers',
  function PhotosController($scope, $log, VtmLayers) {
    VtmLayers.showLayer('photos');
    VtmLayers.hideLayer('veg');
    VtmLayers.hideLayer('plots');
  }
]);
;
angular.module('vtm.home', [
  'ui.router',
  'ui.bootstrap',
  'directives.animatedBanner',
  'matchMedia'
]).config([
  '$stateProvider',
  function config($stateProvider) {
    $stateProvider.state('home', {
      url: '/home',
      controller: 'HomeCtrl',
      templateUrl: 'home/home.tpl.html',
      data: { pageTitle: 'Home' }
    });
  }
]).controller('HomeCtrl', [
  '$scope',
  '$timeout',
  'screenSize',
  function HomeController($scope, $timeout, screenSize) {
    if (screenSize.is('xs')) {
      $scope.image = {
        source: 'assets/img/banner_background_1140x560.jpg',
        text: ''
      };
    } else {
      $scope.images = [
        {
          source: 'assets/img/banner_sfbay_1140x560.jpg',
          text: ''
        },
        {
          source: 'assets/img/banner_yosemite_1140x560.jpg',
          text: ''
        },
        {
          source: 'assets/img/banner_drawer_1140x560.jpg',
          text: ''
        },
        {
          source: 'assets/img/banner_bigtree_1140x560.jpg',
          text: ''
        },
        {
          source: 'assets/img/banner_eldorado_1140x560.jpg',
          text: ''
        },
        {
          source: 'assets/img/banner_placer_1140x560.jpg',
          text: ''
        },
        {
          source: 'assets/img/banner_placer-plot_1140x560.jpg',
          text: ''
        },
        {
          source: 'assets/img/banner_lookout_1140x560.jpg',
          text: ''
        }
      ];
      var imageCount = $scope.images.length;
      var index = Math.floor(Math.random() * imageCount * 2 % imageCount);
      $scope.image = $scope.images[index];
      var slideImage = function () {
          var loop = $timeout(function changePic() {
              index = (index + 1) % imageCount;
              $scope.image = $scope.images[index];
              loop = $timeout(changePic, 10000);
            }, 5000);
        }();
    }
  }
]);
;
angular.module('vtm.howto', []).config([
  '$stateProvider',
  function config($stateProvider) {
    $stateProvider.state('howto', {
      abstract: true,
      url: '/howto',
      controller: 'HowtoCtrl',
      templateUrl: 'howto/howto.tpl.html'
    }).state('howto.overview', {
      url: '/',
      templateUrl: 'howto/howto.overview.tpl.html',
      data: { pageTitle: 'How To Use This Data' }
    });
  }
]).controller('HowtoCtrl', [
  '$scope',
  function UseCtrl($scope) {
  }
]);
;
angular.module('directives.animatedBanner', []).directive('animatedBanner', [
  '$animate',
  '$window',
  '$timeout',
  function ($animate, $window, $timeout) {
    return {
      restrict: 'E',
      link: function (scope, element, attrs) {
        var image = scope.image;
        scope.$watch('image', function (newVal) {
          if (newVal) {
            $animate.addClass(element, 'animated fadeIn', function () {
              $timeout(function () {
                $animate.removeClass(element, 'animated fadeOut');
              }, 2000);
            });
          }
        });
      }
    };
  }
]);
;
angular.module('directives.disableAnimation', []).directive('disableAnimation', [function ($animate) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        attrs.$observe('disableAnimation', function (value) {
          $animate.enabled(!value, element);
        });
      }
    };
  }]);
;
angular.module('directives.customLayerControl', ['services.VtmLayerService']).directive('customLayerControl', [
  'VtmLayers',
  function (VtmLayers) {
    return {
      restrict: 'A',
      scope: {
        icon: '@',
        layer: '@',
        defaultLayer: '@?'
      },
      template: '<a href="" title="{{ layer }} show/hide"><i class="{{ icon }}"></i></a>',
      link: function (scope, element, attrs) {
        var layer = attrs.layer;
        element.bind('click', function () {
          scope.$apply(function () {
            VtmLayers.toggleLayer(layer);
            element.toggleClass('disabled');
          });
        });
        if (VtmLayers.isVisible(layer)) {
          if (element.hasClass('disabled')) {
            element.removeClass('disabled');
          }
        } else {
          element.addClass('disabled');
        }
        element.addClass('map-control');
        element.addClass('layer-control');
      }
    };
  }
]);
;
angular.module('directives.customLegendControl', []).directive('customLegendControl', [
  '$modal',
  function ($modal) {
    return {
      restrict: 'A',
      template: '<a href="" title="map legend"><i class="fa fa-bars"></i></a>',
      link: function (scope, element, attrs) {
        element.bind('click', function () {
          scope.$apply(function () {
            $modal.open({ templateUrl: 'data/data.legend.tpl.html' });
          });
        });
        element.addClass('map-control');
        element.addClass('legend-control');
      }
    };
  }
]);
;
angular.module('directives.repeatDelimiter', []).directive('repeatDelimiter', [function () {
    function compile(element, attributes) {
      var delimiter = attributes.bnRepeatDelimiter || ',';
      var delimiterHtml = '<span ng-show=\' ! $last \'>' + delimiter + '</span>';
      var html = element.html().replace(/(\s*$)/i, function (whitespace) {
          return delimiterHtml + whitespace;
        });
      element.html(html);
    }
    return {
      compile: compile,
      priority: 1001,
      restirct: 'A'
    };
  }]);
;
angular.module('directives.resizableImage', []).directive('resizableImage', [
  '$window',
  function ($window) {
    function ScaleImage(srcwidth, srcheight, targetwidth, targetheight, fLetterBox) {
      var result = {
          width: 0,
          height: 0,
          fScaleToTargetWidth: true
        };
      if (srcwidth <= 0 || srcheight <= 0 || targetwidth <= 0 || targetheight <= 0) {
        return result;
      }
      var scaleX1 = targetwidth;
      var scaleY1 = srcheight * targetwidth / srcwidth;
      var scaleX2 = srcwidth * targetheight / srcheight;
      var scaleY2 = targetheight;
      var fScaleOnWidth = scaleX2 > targetwidth;
      if (fScaleOnWidth) {
        fScaleOnWidth = fLetterBox;
      } else {
        fScaleOnWidth = !fLetterBox;
      }
      if (fScaleOnWidth) {
        result.width = Math.floor(scaleX1);
        result.height = Math.floor(scaleY1);
        result.fScaleToTargetWidth = true;
      } else {
        result.width = Math.floor(scaleX2);
        result.height = Math.floor(scaleY2);
        result.fScaleToTargetWidth = false;
      }
      result.targetleft = Math.floor((targetwidth - result.width) / 2);
      result.targettop = Math.floor((targetheight - result.height) / 2);
      return result;
    }
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var windowHeight, windowWidth;
        scope.resizeImage = function () {
          var img = element;
          var w = $(img).width();
          var h = $(img).height();
          var tw = $(img).offsetParent().width();
          var th = $(img).offsetParent().height();
          if (w > h) {
            tw = tw + tw * 0.25;
            th = th + th * 0.25;
          }
          var result = new ScaleImage(w, h, tw, th, false);
          img[0].width = result.width;
          img[0].height = result.height;
          var newImgX = Math.round((tw - img[0].width) / 2);
          var newImgY = Math.round((th - img[0].height) / 3);
          $(img).css('top', newImgY);
          $(img).css('left', newImgX);
        };
        scope.initializeWindowSize = function () {
          windowHeight = $window.innerHeight;
          windowWidth = $window.innerWidth;
        };
        angular.element($window).bind('resize', function () {
          scope.resizeImage();
          scope.$apply();
        });
        element.bind('load', function () {
          scope.resizeImage();
        });
      }
    };
  }
]);
;
angular.module('filters.split', []).filter('split', [function () {
    return function (input, splitChar, splitIndex) {
      return input.split(splitChar)[splitIndex];
    };
  }]);
;
angular.module('filters.thumbnail', []).filter('thumbnailUrl', [function () {
    return function (url) {
      var thumbnailUrl = url.replace(/imgs\/(.*?)(\/)/, 'imgs/128x192/');
      return thumbnailUrl;
    };
  }]);
;
angular.module('services.HolosPaginatedResource', ['restangular']).factory('HolosPaginated', [
  '$q',
  'Restangular',
  function ($q, Restangular) {
    var ServiceProvider = function () {
    };
    ServiceProvider.prototype.loadList = function (resource, queryParams) {
      var deferred = $q.defer();
      var collection = [];
      var nextUrl;
      var loadNextPage = function (nextUrl) {
        Restangular.allUrl(resource, nextUrl).getList().then(function (d) {
          collection = collection.concat(d.results);
          if (d.next) {
            nextUrl = d.next;
            loadNextPage(nextUrl);
          } else {
            deferred.resolve(collection);
          }
        });
      };
      Restangular.all(resource).getList(queryParams).then(function (d) {
        collection = collection.concat(d.results);
        if (d.next) {
          nextUrl = d.next;
          loadNextPage(nextUrl);
        } else {
          deferred.resolve(collection);
        }
      });
      return deferred.promise;
    };
    var service = {
        getInstance: function () {
          return new ServiceProvider();
        }
      };
    return service;
  }
]);
;
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
angular.module('services.VtmPhotoService', ['services.HolosPaginatedResource']).factory('VtmPhotos', [
  '$q',
  'HolosPaginated',
  function ($q, HolosPaginated) {
    var markerArray = [];
    var markerCount;
    var icons = {
        photoIcon: {
          type: 'div',
          iconSize: [
            20,
            20
          ],
          iconAnchor: [
            0,
            0
          ],
          className: 'photo-marker-icon'
        }
      };
    var queryParams = {
        'collection_code': 'VTM',
        'georeferenced': true,
        'format': 'json'
      };
    var newMarker = function (jsonObject, index) {
      var marker = {};
      for (var k in jsonObject) {
        if (jsonObject.hasOwnProperty(k)) {
          if (k === 'geometry') {
            marker.lat = jsonObject.geometry.coordinates[1];
            marker.lng = jsonObject.geometry.coordinates[0];
          } else {
            marker[k] = jsonObject[k];
          }
        }
      }
      marker.layer = 'photos';
      marker.icon = icons.photoIcon;
      marker.clickable = true;
      return marker;
    };
    var createMarkers = function (data) {
      markerArray.length = 0;
      var idx = 0;
      data.forEach(function (jsonObject) {
        if (jsonObject && jsonObject.geometry.coordinates) {
          var marker = newMarker(jsonObject, idx);
          markerArray.push(marker);
          idx++;
        }
      });
      markerCount = markerArray.length;
      console.log(markerCount + ' new photo markers created');
    };
    return {
      loadMarkers: function (extraParams) {
        var deferred = $q.defer();
        for (var p in extraParams) {
          if (extraParams.hasOwnProperty(p)) {
            queryParams[p] = extraParams[p];
          }
        }
        var holosInstance = HolosPaginated.getInstance();
        holosInstance.loadList('photos', queryParams).then(function (data) {
          if (data.length > 0) {
            createMarkers(data);
            deferred.resolve(markerArray);
          }
        });
        return deferred.promise;
      }
    };
  }
]);
;
angular.module('services.VtmPlotsService', ['services.HolosPaginatedResource']).factory('VtmPlots', [
  '$q',
  'HolosPaginated',
  function ($q, HolosPaginated) {
    var markerArray = [];
    var markerCount;
    var icons = {
        plotIcon: {
          type: 'div',
          iconSize: [
            10,
            10
          ],
          iconAnchor: [
            0,
            0
          ],
          className: 'plot-marker-icon'
        }
      };
    var queryParams = {
        'format': 'json',
        'fields': 'plot_no,url,geojson'
      };
    var newMarker = function (jsonObject, index) {
      var marker = {};
      if (jsonObject.hasOwnProperty('geojson')) {
        marker.lat = jsonObject.geojson.coordinates[1];
        marker.lng = jsonObject.geojson.coordinates[0];
      } else {
        return;
      }
      marker.plot_no = jsonObject.plot_no;
      marker.url = jsonObject.url;
      marker.layer = 'plots';
      marker.icon = icons.plotIcon;
      marker.clickable = true;
      return marker;
    };
    var createMarkers = function (data) {
      markerArray.length = 0;
      var idx = 0;
      data.forEach(function (jsonObject) {
        if (jsonObject && jsonObject.geojson.coordinates) {
          var marker = newMarker(jsonObject, idx);
          markerArray.push(marker);
          idx++;
        }
      });
      markerCount = markerArray.length;
      console.log(markerCount + ' new plot markers created');
    };
    return {
      loadMarkers: function (extraParams) {
        var deferred = $q.defer();
        for (var p in extraParams) {
          if (extraParams.hasOwnProperty(p)) {
            queryParams[p] = extraParams[p];
          }
        }
        var holosInstance = HolosPaginated.getInstance();
        holosInstance.loadList('vtmplots', queryParams).then(function (data) {
          if (data.length > 0) {
            createMarkers(data);
            deferred.resolve(markerArray);
          }
        });
        return deferred.promise;
      }
    };
  }
]);
;
angular.module('services.debounce', []).factory('$debounce', [
  '$rootScope',
  '$browser',
  '$q',
  '$exceptionHandler',
  function ($rootScope, $browser, $q, $exceptionHandler) {
    var deferreds = {}, methods = {}, uuid = 0;
    function debounce(fn, delay, invokeApply) {
      var deferred = $q.defer(), promise = deferred.promise, skipApply = angular.isDefined(invokeApply) && !invokeApply, timeoutId, cleanup, methodId, bouncing = false;
      angular.forEach(methods, function (value, key) {
        if (angular.equals(methods[key].fn, fn)) {
          bouncing = true;
          methodId = key;
        }
      });
      if (!bouncing) {
        methodId = uuid++;
        methods[methodId] = { fn: fn };
      } else {
        deferreds[methods[methodId].timeoutId].reject('bounced');
        $browser.defer.cancel(methods[methodId].timeoutId);
      }
      var debounced = function () {
        delete methods[methodId];
        try {
          deferred.resolve(fn());
        } catch (e) {
          deferred.reject(e);
          $exceptionHandler(e);
        }
        if (!skipApply) {
          $rootScope.$apply();
        }
      };
      timeoutId = $browser.defer(debounced, delay);
      methods[methodId].timeoutId = timeoutId;
      cleanup = function (reason) {
        delete deferreds[promise.$$timeoutId];
      };
      promise.$$timeoutId = timeoutId;
      deferreds[timeoutId] = deferred;
      promise.then(cleanup, cleanup);
      return promise;
    }
    debounce.cancel = function (promise) {
      if (promise && promise.$$timeoutId in deferreds) {
        deferreds[promise.$$timeoutId].reject('canceled');
        return $browser.defer.cancel(promise.$$timeoutId);
      }
      return false;
    };
    return debounce;
  }
]);
;
angular.module('templates-app', ['about/about.bibliography.tpl.html', 'about/about.citations.tpl.html', 'about/about.description.tpl.html', 'about/about.faq.tpl.html', 'about/about.metadata.tpl.html', 'about/about.overview.tpl.html', 'about/about.photos.tpl.html', 'about/about.plotdata.tpl.html', 'about/about.plotmaps.tpl.html', 'about/about.tpl.html', 'about/about.vegmaps.tpl.html', 'data/data.legend.tpl.html', 'data/data.overview.tpl.html', 'data/data.photos.tpl.html', 'data/data.plots.tpl.html', 'data/data.popup.tpl.html', 'data/data.tpl.html', 'data/data.vegetation.tpl.html', 'data/popup/photos.popup.tpl.html', 'data/popup/plots.popup.tpl.html', 'data/popup/vegetation.popup.tpl.html', 'home/home.tpl.html', 'howto/howto.overview.tpl.html', 'howto/howto.tpl.html']);

angular.module("about/about.bibliography.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.bibliography.tpl.html",
    "<div class=\"row\" id=\"#about\">\n" +
    "    <div class=\"col-sm-12\">\n" +
    "\n" +
    "        <p>California Forest and Range Experiment Station., \"Vegetation type maps of California and Western Nevada\" (U.S. Forest Service, Washington, D.C., 1932).</p>\n" +
    "\n" +
    "        <p>California Forest and Range Experiment Station., \"Vegetation types of California (exclusive of deserts and cultivated lands),\" maps (1932).</p>\n" +
    "\n" +
    "        <p>California. Division of Forestry., \"Upland soils of Mendocino County : (exclusive of National Forests areas),\" , 1 map (1951).</p>\n" +
    "\n" +
    "        <p>A. E. Wieslander., \"Forest areas, timber volumes and vegetation types in California\" (California Forest and Range Experiment Station, Berkeley, Calif., 1946).</p>\n" +
    "\n" +
    "        <p>A. E. Wieslander., \"Management plan, Eastern Lassen Working Circle\" (Lassen National Forest, Calif., 1922).</p>\n" +
    "\n" +
    "        <p>A. E. Wieslander., \"Fire protection map of the forest plantations in the Oakland and Berkeley Hills : City of Oakland, Alameda County, California,\" , 1 ms. map (1915).</p>\n" +
    "\n" +
    "        <p>A. E. Wieslander., \"Botanical type map of Muir Woods Basin : Redwood Canyon, Marin Co., California,\" , 1 map (1914).</p>\n" +
    "\n" +
    "        <p>A. E. Wieslander., \"A.E. Wieslander papers,\" , 1 v., 1 carton, 1 oversize folder.; 21 sound cassettes.</p>\n" +
    "\n" +
    "        <p>A. E. Wieslander., \"A vegetation type map of California.\" Madro&ntilde;o 2:140-144 (1935).</p>\n" +
    "\n" +
    "        <p>A. E. Wieslander.,\"First steps of the forest survey in California,\" Journal of Foresty 33:877-884.</p>\n" +
    "\n" +
    "        <p>A. E. Wieslander.,H.A. Jensen, and H.S. Yates. \"California vegetation type map:Instructions for the preparation of the vegetative type map of California\". Unpublished USDA Forest Service Report (1933).</p>\n" +
    "\n" +
    "        <p>D. Weeks, A.E. Wieslander., \"Land Utilization statistics for the northern Sierra Nevada\". Calfironiat Forest and Range Experiment Station (1942).</p>\n" +
    "\n" +
    "        <h3>Other Resources</h3>\n" +
    "\n" +
    "        <p>Wieslander, A.E. 1986. <a href=\"http://texts.cdlib.org/view?docId=hb7j49p23f\">A.E. Wieslander, California forester: mapper of wildland vegetation and soils (an oral history conducted in 1985 by Ann Lange).</a> Regional Oral History Office, Bancroft Library, University of California, Berkeley, CA.</p>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("about/about.citations.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.citations.tpl.html",
    "<div class=\"row\" id=\"citation\">\n" +
    "	<div class=\"col-sm-12\">\n" +
    "	    <p>If you are using the VTM digital vegetation data downloaded from this site in your study, please cite the following papers in your work:</p>\n" +
    "		<ul>\n" +
    "		    <li>Kelly, M., B. Allen-Diaz, and N. Kobzina. 2005. <a href=\"http://kellylab.berkeley.edu/publications/2005/9/30/digitization-of-the-wieslander-california-vegetation-type-ma.html\" target=\"_blank\">Digitization of a historic dataset: the Wieslander California vegetation type mapping project.</a> Madro&ntilde;o 52(3):191-201.</li>\n" +
    "\n" +
    "		    <li>Kelly, M., K. Ueda and B. Allen-Diaz. 2008. <a href=\"http://kellylab.berkeley.edu/publications/2008/10/31/historic-map-analysis-spatial-error-in-the-ca-vtm-dataset.html\" target=\"_blank\"> Considerations for ecological reconstruction of historic vegetation: Analysis of the spatial uncertainties in the California Vegetation Type Map dataset.</a> Plant Ecology 194 (1): 37-49.</li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("about/about.description.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.description.tpl.html",
    "<div class=\"row\">\n" +
    "    <div class=\"col-sm-12\">\n" +
    "\n" +
    "        <tabset type=\"pills\">\n" +
    "            <tab heading=\"Plot Data\">\n" +
    "                <ng-include src=\"'about/about.plotdata.tpl.html'\">\n" +
    "                </ng-include>\n" +
    "            </tab>\n" +
    "            <tab heading=\"Plot Maps\">\n" +
    "                <ng-include src=\"'about/about.plotmaps.tpl.html'\">\n" +
    "                </ng-include>\n" +
    "            </tab>\n" +
    "            <tab heading=\"Vegetation Maps\">\n" +
    "                <ng-include src=\"'about/about.vegmaps.tpl.html'\">\n" +
    "                </ng-include>\n" +
    "            </tab>\n" +
    "            <tab heading=\"Photos\">\n" +
    "                <ng-include src=\"'about/about.photos.tpl.html'\">\n" +
    "                </ng-include>\n" +
    "            </tab>\n" +
    "        </tabset>\n" +
    "    	\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("about/about.faq.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.faq.tpl.html",
    "<div class=\"row\">\n" +
    "	<div class=\"col-sm-12\">\n" +
    "		<h3>What is an \"Unmatched species code\"?</h3>\n" +
    "		<p>An \"Unmatched species code\" refers to a code that we haven't been able to associate with a species.  When the original VTM surveyors recorded their data, they used 1-3 letter codes to refer to different species.  They listed most of these codes and their corresponding species in the VTM field manual, or along with the original data sheets, but not all of them.  Sometimes they also recorded irregular codes, or made typos, neither of which match to a species given the listings in the manual.</p>\n" +
    "\n" +
    "		<h3>What is an \"Ambiguous species code\"?</h3>\n" +
    "		<p>An \"Ambiguous species code\" refers to a code that could refer to multiple different species.  Sometimes the original surveyors used the same code to refer to different species when they were working in different places.  Several of the species code crosswalks they left behind are quad specific, so if a code means one thing in the Napa quad and another in the Placerville quad, we can distinguish them.  However, several ambiguous codes are not quad specific, so given an ambiguous code in an area where none of the quad-specific crosswalks apply, we just report all the species to which the code could refer.</p>\n" +
    "\n" +
    "		<h3>What do you mean by \"<em>Probable</em> Species\"?</h3>\n" +
    "		<p>Given the above complications in translating the species codes to full species names, and the errors inherent in the original data and those contributed by modern data entry,  we don't consider all our translations to be completely accurate.  Next to each name, you should see a link that will pop up a window showing you all the code-to-species matches from the various translation tables included in the original VTM data.</p>\n" +
    "\n" +
    "		<h3>How do you translate the species codes to actual species names?</h3>\n" +
    "		<p>The VTM data come with several lists of occasionally contradictory code-to-species translations, covering different areas of the state.</p>\n" +
    "				\n" +
    "		<div>\n" +
    "			<table class=\"table table-hover\">\n" +
    "				<thead>\n" +
    "					<tr>\n" +
    "						<th>Source</th>\n" +
    "						<th>Reference</th>\n" +
    "					</tr>\n" +
    "				</thead>\n" +
    "				\n" +
    "				<tbody>\n" +
    "					<tr id=\"1\">\n" +
    "						<td>1</td>\n" +
    "						<td>\n" +
    "							Wieslander, A.E., H.A. Jensen, H.S. Yates. 1933.  \"California Vegetative Type Map: Instructions for the Preparation of the Vegetative Type Map of California.\"  Unpublished report for US Dept of Agriculture, Forest Service.  Approximately 58 pp.\n" +
    "							\n" +
    "							<p>List 1 appears at the end of the report. It includes approximately 912 species codes for trees, shrubs, and herbs.</p>\n" +
    "							\n" +
    "						</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>2</td>\n" +
    "						<td>\n" +
    "							1938.  \"List of Plant Symbols for Use on the Vegetation Type Survey of California and Western Nevada.\"  Unpublished report for US Dept of Agriculture, Forest Service.\n" +
    "							\n" +
    "							<p>List 2 is the first list in the report and includes approximately 1,492 species codes for plants other than grasses.</p>\n" +
    "						</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>3</td>\n" +
    "						<td>\n" +
    "							1938.  \"List of Plant Symbols for Use on the Vegetation Type Survey of California and Western Nevada.\"  Unpublished report for US Dept of Agriculture, Forest Service.  \n" +
    "							\n" +
    "							<p>List 3 is the second list in the report and includes approximately 1,495 species codes for plants other than grasses, most are duplicated in list 2.</p>\n" +
    "						</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>4</td>\n" +
    "						<td>\n" +
    "							Wieslander, A.E., H.S. Yates, H.A. Jensen, and P.L Johannsen. (no date) \"Manual of Field Instructions for Vegetation Type Map of California.\" Unpublished report for US Dept of Agriculture, Forest Service. 196 pp.\n" +
    "							\n" +
    "							<p>We  refer to this document as \"the field manual\".  It includes approximately 1,675 species codes for trees, shrubs, and herbs.</p>\n" +
    "						</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>5</td>\n" +
    "						<td>\n" +
    "							1938.  \"List of Plant Symbols for Use on the Vegetation Type Survey of California and Western Nevada.\"  Unpublished report for US Dept of Agriculture, Forest Service.\n" +
    "							\n" +
    "							<p>List 5 is the third list in the report and includes approximately 246 species codes for grasses.</p>\n" +
    "						</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>6</td>\n" +
    "						<td>\n" +
    "							1938.  \"List of Plant Symbols for Use on the Vegetation Type Survey of California and Western Nevada.\"  Unpublished report for US Dept of Agriculture, Forest Service.\n" +
    "							\n" +
    "							<p>Reference is the same for list 2.  List 6 is the fourth list in the report and includes approximately 247 species codes for grasses, most are duplicated in list 5.</p>\n" +
    "						</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>common name</td>\n" +
    "						<td>Common name recorded on the datasheet without a code that can only correctly code to one particular genus, as in \"Juniper\" for <i>Juniperus sp.</i></td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>datasheet notations</td>\n" +
    "						<td>Code translations recorded on one or more plot datasheets and do not appear on a species list.</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Jensen1947</td>\n" +
    "						<td>Jensen, Herbert A. 1947. A system for classifying vegetation in California.  <i>California Fish and Game</i> 33(4): 199-266.</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>suggestion</td>\n" +
    "						<td>A code translation that does not appear on any species lists nor on any of the plot datasheets but we think is very likely to be correct.  Examples of suggestions are \"Arcto Sp.\" translated to <i>Arctostaphylos sp.</i> and \"Sym\" translated to <i>Symphoricarpus sp.</i></td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Vegetation Type Map</td>\n" +
    "						<td>A code for a vegetation type from the vegetation type maps.</td>\n" +
    "					</tr>\n" +
    "				</tbody>\n" +
    "			</table>\n" +
    "		</div>\n" +
    "		\n" +
    "		<p>All other lists are quad specific lists.  They are typed or written on one or more small pieces of paper and were found with their corresponding quad's vegetation plot data sheets.  They include the following lists:</p>\n" +
    "		\n" +
    "		<div>\n" +
    "			<table class=\"table table-hover\">\n" +
    "				<thead>\n" +
    "					<tr>\n" +
    "						<th>List</th>\n" +
    "						<th>Quad/Map No.</th>\n" +
    "						<th>Quality</th>\n" +
    "					</tr>\n" +
    "				</thead>\n" +
    "				\n" +
    "				<tbody>\n" +
    "					<tr>\n" +
    "						<td>Markleeville</td>\n" +
    "						<td>54</td>\n" +
    "						<td>handwritten</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Pyramid Peak</td>\n" +
    "						<td>55</td>\n" +
    "						<td>typed</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Placerville</td>\n" +
    "						<td>56</td>\n" +
    "						<td>typed</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Petaluma</td>\n" +
    "						<td>64D</td>\n" +
    "						<td>handwritten</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Carquinez</td>\n" +
    "						<td>65</td>\n" +
    "						<td>handwritten</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Hollister</td>\n" +
    "						<td>104B</td>\n" +
    "						<td>typed</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Metz</td>\n" +
    "						<td>107A</td>\n" +
    "						<td>typed</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Soledad</td>\n" +
    "						<td>107B</td>\n" +
    "						<td>typed</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Priest Valley</td>\n" +
    "						<td>108</td>\n" +
    "						<td>handwritten</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Coalinga</td>\n" +
    "						<td>109</td>\n" +
    "						<td>handwritten</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Cholame</td>\n" +
    "						<td>129</td>\n" +
    "						<td>handwritten</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>McKittrick</td>\n" +
    "						<td>134</td>\n" +
    "						<td>handwritten</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Tejon</td>\n" +
    "						<td>154</td>\n" +
    "						<td>handwritten</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Mt Pinos</td>\n" +
    "						<td>155</td>\n" +
    "						<td>handwritten</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Pasadena</td>\n" +
    "						<td>162D</td>\n" +
    "						<td>handwritten</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Deep Creek</td>\n" +
    "						<td>164A</td>\n" +
    "						<td>handwritten</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>Capistrano</td>\n" +
    "						<td>179A</td>\n" +
    "						<td>typed</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>San Luis Rey</td>\n" +
    "						<td>180</td>\n" +
    "						<td>typed</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>La Jolla-El Cajon-San Diego</td>\n" +
    "						<td>191, 192A</td>\n" +
    "						<td>handwritten</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>El Cajon</td>\n" +
    "						<td>191</td>\n" +
    "						<td>handwritten</td>\n" +
    "					</tr>\n" +
    "					<tr>\n" +
    "						<td>La Jolla</td>\n" +
    "						<td>192A</td>\n" +
    "						<td>typed</td>\n" +
    "					</tr>\n" +
    "				</tbody>\n" +
    "			</table>\n" +
    "		</div>\n" +
    "\n" +
    "		<h3>Why do some species appear in areas where they couldn't possibly have been found?</h3>		\n" +
    "		<p>As mentioned above, some species codes are ambiguous, and we do our best to report that ambiguity when it occurs.  There is also some error in the data, originating both from the original surveyors and from the modern digitization effort.  We have made no attempt to correct potentially erroneous codes in the original data, but we have reported the levels of modern data entry errors in the <a href ui-sref=\"about.plotdata\">description of the plot data</a>.</p>\n" +
    "\n" +
    "		<h3>Do you plan to provide scans of the original plot datasheets?</h3>\n" +
    "		<p>We are working on providing scans of the original plot datasheets.</p>\n" +
    "\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("about/about.metadata.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.metadata.tpl.html",
    "<div class=\"row\">\n" +
    "    <div class=\"col-sm-12\">\n" +
    "\n" +
    "    	<p>\n" +
    "		  This document contains field descriptions for the VTM plot data. For quality control and assurance activities, including standardization/lumping processes, see <a href ui-sref=\"about.description\">Plot Data description</a>.\n" +
    "		</p>\n" +
    "\n" +
    "		<h3>\n" +
    "		  Terms used in this document\n" +
    "		</h3>\n" +
    "		<p>\n" +
    "		  <b>Datasheet</b>: original VTM plot datasheet (either Brush and Tree Plot datasheet or Grass Plot datasheet)\n" +
    "		</p>\n" +
    "		<p>\n" +
    "		  <b>Data enterer</b>: person that entered data into Access database in 2004\n" +
    "		</p>\n" +
    "		<p>\n" +
    "		  <b>Field recorder</b>: original VTM personnel that recorded plot data on datasheet\n" +
    "		</p>\n" +
    "		<p>\n" +
    "		  <b>Truth table</b>: lumping table/grouping table to allow for grouping of certain data into broader categories than what was entered.  Not everything that was entered in a field needed to be grouped.  Mainly used to standardize variations in text that had the same meaning.\n" +
    "		</p>\n" +
    "\n" +
    "		<h3>\n" +
    "		  Field Descriptions\n" +
    "		</h3>\n" +
    "		<p>Fields are listed according to the order that they appear on datasheets.\n" +
    "		</p>\n" +
    "\n" +
    "    	<tabset type=\"pills\">\n" +
    "\n" +
    "    		<tab heading=\"Plot\">\n" +
    "    			<h4>\n" +
    "				  Plot_ID\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  An automated number was assigned to each datasheet entered in the database.\n" +
    "				</p>\n" +
    "				<h4>\n" +
    "				  Quadrangle\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Name of quadrangle as written on datasheet.\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>Entries for this field were standardized via the Quadrangle truth table.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Map\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Plot map number as written on datasheet.\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>The location of each plot is drawn on a topo map that is folded and stored with the associated datasheets.  This map has a number on it, which is also written on the tab top index card (along with the quad name) that organizes the datasheets in the drawers where they are stored.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Plot No.\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Letter and number combination written in red ink at top of front page on datasheet.\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>Corresponds to location on plot map.  For example, A-1-1 plot number is located in the A1 section on the plot map, and is located where the circled 1 is written in this section.\n" +
    "				  </li>\n" +
    "				  <li>The plot number we entered is different from the number that is written on the datasheet next to the heading &ldquo;Plot No.&rdquo;, which is written in pencil and not in red ink.  Wieslander's <a target=\"_blank\" href=\"http://digitalassets.lib.berkeley.edu/vtm/ucb/text/cubio_vtm_fm.pdf\">Manual of Field Instructions for Vegetation Type Map of California</a> cites on p.76 that plots are numbered consecutively for each quadrangle, and this number was written next to &ldquo;Plot No.&rdquo; in pencil.  However, this number does not correspond directly to the location on the plot map.  Whenever the field recorder referred to the &ldquo;Plot No.&rdquo; (the number written in pencil) on the form, the data enterer also typed the corresponding Plot Key in parentheses.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Plot Key\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Combination of map number and plot number without spaces or dashes.\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>The Plot Key is a construct of the database management process, which necessitated a way to assign a unique but meaningful identifier for each datasheet entered.  Plot key was entered by hand during data entry of each datasheet; it was not an automated field.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Geographic Location\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Plot location as written on datasheet, exceptions noted below. \n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>This field often includes mileage information, for ex. &ldquo;2 miles South of Mason Flat&rdquo;.  If miles were written as fractions, these were usually converted to a decimal when entered.  Also, if miles were written in abbreviated form (such as Mi. or mi.) it was sometimes entered in unabbreviated form.  For ex. &ldquo;2S Mi. South of Mason Flat&rdquo; may have been entered as &ldquo;2.33 miles South of Mason Flat&rdquo;. Some common conversions include:\n" +
    "				    <p>\n" +
    "				      <sup>1</sup>/<sub>16 </sub> = .06<br>\n" +
    "				      <sup>1</sup>/<sub>8  </sub> = .125 or .13<br>\n" +
    "				      <sup>1</sup>/<sub>6  </sub> = .167 or .17<br>\n" +
    "				      <sup>5</sup>/<sub>8  </sub> = .625 or .63<br>\n" +
    "				      <sup>2</sup>/<sub>3  </sub> = .667 or .67<br>\n" +
    "				      <sup>5</sup>/<sub>6  </sub> = .83<br>\n" +
    "				      <sup>7</sup>/<sub>8  </sub> = .875\n" +
    "				    </p>\n" +
    "				  </li>\n" +
    "				  <li>Sometimes plot location was described geographically in relation to a symbol or word on the plot map.  For ex., &ldquo;2.5 miles S of (triangle symbol with a dot in it) of Mt. Hamilton.&rdquo; Refers to the mountain top marker on the map that looks like a triangle with a small dot in the center of it and often has an elevation written next to it to indicate the elevation of the mountain peak.   Or for ex., &ldquo;0.2 miles S of &lsquo;S&rsquo; in Santa Rosa&rdquo;  refers to the letter S in the word Santa Rosa that appears on the plot map.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Date\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Date as written on datasheet, exceptions noted below.\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>The date field would only allow entries in a format of mm/dd/yyyy, and did not allow missing data. \n" +
    "				  </li>\n" +
    "				  <li>Dates with missing days were entered by entering &ldquo;01&rdquo; for the missing day.  Dates with missing years were entered by entering the year that other nearby plots were recorded in that quad (see QA Write up.doc).\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Section\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Section number as written on datasheet, exceptions noted below.\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>Occasionally, the field size was too small to enter all that was written, ie, anything other than the standard one or two digit number that usually indicates the section number.  For ex., Section was sometimes written as &ldquo;grants&rdquo; or &ldquo;unsurveyed&rdquo;.  Section was also sometimes written with hyphenated values to indicate multiple section numbers, for ex., &ldquo;12-14&rdquo;.  Since this data did not fit in this field it was also entered in Miscellaneous_Notes field.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Township\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Township as written on datasheet.\n" +
    "				</p>\n" +
    "				<h4>\n" +
    "				  Range\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Range as written on datasheet, exceptions noted below. \n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>Sometimes range was written in parentheses on the datasheet.  The database field would not allow parentheses, so in these cases it was either entered in the Miscellaneous_Notes field or it was entered without parenthesis in the range field with a note in the Miscellaneous_Notes field indicating that the range was written in parentheses.\n" +
    "				  </li>\n" +
    "				  <li>Sometimes range was written with two or three letters following it.  For ex. &ldquo;8SBM&rdquo; or &ldquo;12AES&rdquo;.  These seem to be the initials of VTM personnel that made a change or confirmation to the range written on the datasheet.  Initials were removed in the QC process via the Range truth table.\n" +
    "				  </li>\n" +
    "				  <li>The range was sometimes written with an &ldquo;R&rdquo; before the range number.  For ex. &ldquo;R8S&rdquo;.  R occurrences were removed in the QC process via the Range truth table.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Taken By\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Field recorder's name, usually entered as written on datasheet.  Although the policy was to enter the name exactly as it appeared on the datasheet, first and last names were not necessarily entered in the same order as they were written on the datasheet, and initials were sometimes entered instead of the full name as written on the datasheet.    All entries for this field were standardized via the Taken By truth table.\n" +
    "				</p>\n" +
    "				<h4>\n" +
    "				  Type\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Vegetation type as written on datasheet, either as one or more species codes or as the name of the vegetation type, and sometimes both.  Species codes were entered as written, either with spaces between codes or without spaces between species codes.\n" +
    "				</p>\n" +
    "				<p>\n" +
    "				  Ex: ADC may also appear as A  D  C.\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>On some datasheets, a circled number was written in the upper right hand corner of the back of the datasheet, which is in the same area as the Type section.  In most cases this number was not entered.  In some cases a reference to this number was entered in the Miscellaneous_Notes field, or in the Type field.  The <a target=\"_blank\" href=\"http://digitalassets.lib.berkeley.edu/vtm/ucb/text/cubio_vtm_fm.pdf\">VTM Field Manual</a> may explain what this number refers to.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Exposure\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Plot exposure as written on datasheet (see exceptions below), either as abbreviation of cardinal direction or as the name of the direction (For ex. &ldquo;Southerly&rdquo;)\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>There may be cases when the data enterer did not enter exposure exactly as written on datasheet.  For ex. if &ldquo;So.&rdquo; was written on the datasheet, the data enterer could have entered &ldquo;S&rdquo; or &ldquo;South&rdquo;.  In all cases however, the meaning of what was entered should never be different than what was written on the datasheet.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Slope Percent\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Numerical slope of plot as written on datasheet (unless written as text)\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>This field did not allow text, so when slope was written on datasheet as text (for ex. &ldquo;very steep&rdquo;) it was entered in the Miscellaneous_Notes field\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Elevation\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Elevation of plot as written on datasheet.  This field had an upper bound of 15,000 ft.\n" +
    "				</p>\n" +
    "				<h4>\n" +
    "				  Year of last burn\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Entered as written on datasheet\n" +
    "				</p>\n" +
    "				<h4>\n" +
    "				  Site\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Entered as written on datasheet\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>When a roman numeral was written in this section, the number that the roman numeral represents was entered and a note was added to the Miscellaneous_Notes field to indicate that the number was written as a roman numeral.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Penetrability\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Entered as written on datasheet (if it fit within the field size)\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>This field was a drop down menu (Easy, Medium, Difficult, or Impenetrable) but also allowed text entry.  However the field size was sometimes too small to enter all that was written.  In this case it was entered in the Miscellaneous_Notes field.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Soil depth\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Entered as written on datasheet (if it fit within the field size)\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>This field was a drop down menu (Shallow, Medium, Deep)  but also allowed text entry.  However the field size was sometimes too small to enter all that was written.  In this case it was entered in the Miscellaneous_Notes field.\n" +
    "				  </li>\n" +
    "				  <li>One of the two versions of the datasheet did not have a soil depth section.  Therefore no data was entered about soil depth for these datasheets.\n" +
    "				  </li>\n" +
    "				  <li>Occasionally hyphenated values or values that did not match one of the drop down choices were entered by choosing the drop down value that was essentially the same in meaning, and a note was entered in Miscellaneous Notes field to reference what was exactly written on datasheet.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Parent Rock\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Entered as written on datasheet, except as noted below.\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>This field was a drop down menu (Igneous, Metamorphic, Sedimentary) but also allowed text entry.  However the field size was sometimes too small to enter all that was written.  In this case it was entered in the Miscellaneous_Notes field.\n" +
    "				  </li>\n" +
    "				  <li>There were two versions of the &ldquo;tree plot&rdquo; datasheets.  One of the two versions of the datasheet did not have a soil depth section.  Therefore no data was entered about soil depth for these datasheets.\n" +
    "				  </li>\n" +
    "				  <li>Occasionally hyphenated values or values that did not match one of the drop down choices were entered by choosing the drop down value that was essentially the same in meaning, and a note was entered in Miscellaneous_Notes field to reference what was exactly written on datasheet.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Soil Character field\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Entered as written on datasheet, except as noted below.\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>This section on the datasheet consists of 7 checkboxes (for ex. Rocky, Gravelly, Sandy, etc).  The database entry form had the same checkboxes.  If any other additional information was written on the datasheet (for ex., text written next to the checkboxes) it was entered in the Miscellaneous_Notes field.\n" +
    "				  </li>\n" +
    "				  <li>Occasionally hyphenated values or values that did not match one of the drop down choices were entered by choosing the drop down value that was essentially the same in meaning, and a note was entered in Miscellaneous Notes field to reference what was exactly written on datasheet.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Soil_Origin\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Entered as written on datasheet, except as noted below.\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>There were two versions of the &ldquo;Brush and Tree Plot&rdquo; datasheets.  One version listed 16 different soil origin types, so the field recorder could either check one or more or write in an origin not on the list.  The other datasheet version did not list soil origin types.  There were was a wide range of soil origin types recorded (varying from &ldquo;brown soil&rdquo;to &ldquo;Alluvium of granitics and basalt&rdquo;) each datasheet.  Some soil origin types recorded are technically not a soil origin type (for ex. &ldquo;poor soil&rdquo;).  These were still entered as they appeared on datasheet, unless it was an obvious spelling error, in which case the spelling error was corrected (see &ldquo;Other&rdquo; section at end of this document).\n" +
    "				  </li>\n" +
    "				  <li>Occasionally hyphenated values or values that did not match one of the drop down choices were entered by choosing the drop down value that was essentially the same in meaning, and a note was entered in Miscellaneous Notes field to reference what was exactly written on datasheet.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Excessive Erosion Evidence\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Entered as written on datasheet (if it fit within the field size)\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>In rare cases the field size was not large enough to enter all that was written on the datasheet.  In these cases the remainder was entered in the Miscellaneous_Notes field.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Additional_Ground_Cover-species\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Each species or species code was entered on a separate line in this field.  Species names and species codes were entered as written on datasheet.  Abundance information for a particular species (&ldquo;x&rdquo; or &ldquo;xx&rdquo; or &ldquo;xxx&rdquo;, etc.) was entered after the species name or code and on the same line, with either a space or a hyphen between the species name and its abundance.  Although this was the policy, data enterers sometimes entered the abundance information (&ldquo;x&rdquo;, &ldquo;xx&rdquo;, etc) before the species name, as written on the datasheet.  Also, one of the databases was set to automatically sort species names alphabetically.\n" +
    "				</p>\n" +
    "				<h4>\n" +
    "				  Special Fire Hazards\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Entered as written on datasheet\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>Sometimes the VTM data recorder underlined a word in the heading for this section (&ldquo;Special Fire Hazards (dead brush, snags, etc.)&rdquo; instead of writing it.  For ex., dead brush or snags may have been underlined.  In these cases the word that was underlined was entered in this field.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Remarks\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Entered as written on datasheet (if it fit within the field size)\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>In rare cases the field size was not large enough to write in all that was written on the datasheet.  In these cases the remainder was entered in the Miscellaneous_Notes field.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Miscellaneous_Notes\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  IMPORTANT - The Miscellaneous_Notes field includes both actual data recorded at time of the original VTM survey as well as 2004 data enterers' comments about the datasheet.  The Miscellaneous_Notes field is NOT a section on the datasheet.\n" +
    "				</p>\n" +
    "				<p>\n" +
    "				  This field contains the following types of information:\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>Remarks written on the datasheet that were not written in a particular section, For ex., stray remarks written in margins of the datasheet, or references to species codes: &ldquo;Ap = Apc&rdquo; or &ldquo;Gr2= At2 and Bh2&rdquo;, or &ldquo;Cpo = Ceanothus prostrates&rdquo;\n" +
    "				  </li>\n" +
    "				  <li>Observations about the condition of the datasheet.  For ex., if the datasheet was torn, if the datasheet is blank, or if the datasheet has additional information attached to it such as a grass plot datasheet for the same plot.\n" +
    "				  </li>\n" +
    "				  <li>Other potentially important observations about the datasheet.  For ex., if the datasheet looks like it may contain resurvey data, or if some data was crossed out and changed to something else in a different color pencil or pen.\n" +
    "				  </li>\n" +
    "				  <li>This field also served as a holding place for data that did not fit the format requirements of the database fields. \n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "    		</tab>\n" +
    "\n" +
    "    		<tab heading=\"Brush and Ground Cover\">\n" +
    "				<h4>\n" +
    "				  Species\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Species code as written on datasheet, except as noted below.\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>\n" +
    "				    <b>Symbol conversion with species codes:</b>\n" +
    "				    <ul>\n" +
    "				      <li>Codes with a ^ over text were entered with a 1 following text. For ex. A with a ^ over the A was entered as A1\n" +
    "				      </li>\n" +
    "				      <li>Underlined codes were entered with a 2 following text. For ex., <u>Gr</u>  was entered as Gr2\n" +
    "				      </li>\n" +
    "				      <li>Codes with a line over the top of text were entered with a 3 following text. For ex. H with a line over the H (like H) was entered as H3\n" +
    "				      </li>\n" +
    "				      <li>  Codes with an apostrophe after the text were entered with a 4 following text. For ex. S' was entered as S4\n" +
    "				      </li>\n" +
    "				    </ul>\n" +
    "				  </li>\n" +
    "				  <li>\n" +
    "				    <b>Other notes about species codes:</b>\n" +
    "				    <ul>\n" +
    "				      <li>  Any symbol drawn on the datasheet that could not be entered were entered in its text equivalent.  For example:\n" +
    "				      </li>\n" +
    "				      <li>A species code with a circle drawn around it was entered as the code name then circled.  For ex., a R with a circle drawn around it was entered as &ldquo;R circled&rdquo; or &ldquo;R circle&rdquo;.\n" +
    "				      </li>\n" +
    "				      <li>A species code with a square drawn around it was entered as, for ex. &ldquo;R square&rdquo; or &ldquo;R boxed&rdquo;\n" +
    "				      </li>\n" +
    "				      <li>A pi symbol ( ) drawn next to the code entered as, for ex. &ldquo;R pi&rdquo;\n" +
    "				      </li>\n" +
    "				      <li>Other symbols like sigma and spiral were entered as &ldquo;sigma&rdquo; and &ldquo;spiral&rdquo;.\n" +
    "				      </li>\n" +
    "				      <li>   If a number followed the code, it was entered as it was written.  For ex. &ldquo;W40&rdquo; was entered as &ldquo;W40&rdquo;. \n" +
    "				      </li>\n" +
    "				      <li>   Sometimes two codes were written on the datasheet for one species.  For ex. &ldquo;Qdo=Qd&rdquo;.  In these cases only one code was entered and a note of what was written was entered in the Miscellaneous_Notes field.\n" +
    "				      </li>\n" +
    "				    </ul>\n" +
    "				  </li>\n" +
    "				  <li>\n" +
    "				    <b>Litter species codes:</b>\n" +
    "				    <ul>\n" +
    "				      <li>Litter was usually written on datasheet as Lit and then the species code(s) that comprised the litter.  Sometimes the species codes were written first and then Lit.  Data entry standardized litter to be entered as Lit and then species codes.  Although this was the rule, it was not always entered in this order and data can be found in either notation.    \n" +
    "				      </li>\n" +
    "				      <li>For ex. &ldquo;Lit A&rdquo; or &ldquo;A lit&rdquo; were entered as &ldquo;Lit A&rdquo;\n" +
    "				      </li>\n" +
    "				      <li>The field recorder occasionally recorded the percent cover of litter in the Summary of Brush and Ground Cover section but recorded the components of the litter (ie what species made up the litter) in the Remarks section (in which case it was entered in the Remarks field), or in margins on the datasheet (in which case it was entered in the Miscellaneous Notes field).\n" +
    "				      </li>\n" +
    "				    </ul>\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Percent\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  % Cover number as written on datasheet\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>Occasionally the % Covers of all species did not add up to 100.  In these cases it was still entered as written on datasheet.\n" +
    "				  </li>\n" +
    "				  <li>In rare cases the field recorded did not record the % cover of a species but did fill out the plot diagram completely, allowing the data enterer to calculate and enter the missing cover data.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Height\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Plant height in feet as written on datasheet (except when written in inches).\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>When the datasheet had inches information (for ex. &ldquo;2 in.&rdquo; or &ldquo;2\" &rdquo;, the number in inches was converted to feet.  There may be instances however where the data enterer did not convert to feet and entered it as the way it was written.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Litter_Depth\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Depth of species litter in inches as written on datasheet.\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>&ldquo;T&rdquo; or &ldquo;t&rdquo; was sometimes written on datasheet to indicate &ldquo;trace amount&rdquo;.  In these cases the T or t (whatever was written on the datasheet) was entered. \n" +
    "				  </li>\n" +
    "				  <li>Fractions were usually converted to decimal amount.\n" +
    "				  </li>\n" +
    "				  <li>Litter depths written in feet were usually converted to inches.\n" +
    "				  </li>\n" +
    "				  <li>The field recorder sometimes included the species components of the litter alongside the depth for &ldquo;Litt&rdquo; entries in the Species field (or other codes meaning litter, like &ldquo;Lit&rdquo;).  In these cases the species components were moved to the Species field.  This was done to be consistent with instructions in the <a target=\"_blank\" href=\"http://digitalassets.lib.berkeley.edu/vtm/ucb/text/cubio_vtm_fm.pdf\">VTM Field Manual</a> and the majority of other field recorders that recorded litter component information.  For ex., if the datasheet had &ldquo;0.75 mixture of Y S&rdquo; written for the litter depth of the species code &ldquo;Litt&rdquo;, then it was entered as &ldquo;0.75&rdquo; for the litter depth of species code &ldquo;Litt mixture of Y S&rdquo;.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "    		</tab>\n" +
    "\n" +
    "    		<tab heading=\"Trees\">	\n" +
    "				<h4>\n" +
    "				  Species\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Species code as written on datasheet. See notes under <b>Brush and Ground Cover</b> above for details.\n" +
    "				</p>\n" +
    "				<h4>\n" +
    "				  Diameter Class fields\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Number as written on datasheet, except as noted below.\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>Occasionally the VTM data taker recorded data on diameter classes that did not fit into the set classes on the datasheet.  For ex. &ldquo;&lt;4 inches&rdquo;.  In these cases the information was entered in the Miscellaneous_Notes field.\n" +
    "				  </li>\n" +
    "				  <li>This was a numeric field that did not allow text.  If the number was hyphenated it was entered in the Miscellaneous_Notes field.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "				<h4>\n" +
    "				  Total\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Number as written on datasheet.  This field was later converted to a calculated field that was the sum of dbh counts recorded on the datasheet.  The original version of this field (ie non-calculated) was archived in case it was wanted in the future.\n" +
    "				</p>\n" +
    "				<h4>\n" +
    "				  HT feet\n" +
    "				</h4>\n" +
    "				<p>\n" +
    "				  Number as written on datasheet (unless hyphenated).\n" +
    "				</p>\n" +
    "				<ul>\n" +
    "				  <li>This field did not allow hyphenated values.   Hyphenated values were entered in the Miscellaneous_Notes field.\n" +
    "				  </li>\n" +
    "				  <li>One of the two versions of the brush and tree datasheets does not have a column for tree height.  On these forms, either height was not recorded, or height was  recorded in a drawn in column (often a drawn line split the total column into two columns with total data on the left and height data on the right). When it was clear that these were heights (ie either the word height was written or both totals and heights were recorded), this information was recorded in the height column.  If it was unclear, a note was added in the Miscellaneous_Notes field indicating that additional numbers that are possibly height data were recorded on the datasheet.\n" +
    "				  </li>\n" +
    "				</ul>\n" +
    "    		</tab>\n" +
    "\n" +
    "    	</tabset>\n" +
    "\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("about/about.overview.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.overview.tpl.html",
    "<div class=\"row\" id=\"#about\">\n" +
    "    <div class=\"col-sm-12\">\n" +
    "\n" +
    "		<p><img ng-src=\"assets/img/about_history_surveyors_1140x300.png\" class=\"img-responsive\"></img></p>\n" +
    "\n" +
    "		<p>In the 1930s, forester A. E. Wieslander spearheaded a U. S. Forest Service survey of California vegetation, called the Vegetation Type Mapping Project (VTM).  In this remarkable effort the Forest Service crews mapped over 1/3 (16 million+ hectares) of the state. Because of its comprehensive and detailed nature, the VTM dataset is recognized as a valuable window into the state of early 20th century California flora. The collection has provided data for numerous graduate theses at several Universities, as well as numerous manuscripts in peer-reviewed journals.</p>\n" +
    "\n" +
    "        <p><blockquote>The Wieslander Vegetation Type Mapping collection has been described as &ldquo;the most important and comprehensive botanical map of a large area ever undertaken anywhere on the earth&rsquo;s surface&rdquo;.<small>Jepson et al. 2000</small></blockquote></p>         \n" +
    "\n" +
    "		<p>The ultimate goal of the original VTM project was to create vegetation type maps, but several other types of data were collected in the process.  Vegetation plots, in which crews collected data on species composition, depth of leaf litter, tree size, and other variable, were used to validate the broad zones of vegetation they designated from high vantage points. The plot locations were marked on USGS topographic quadrats for reference. Additionally, sample specimens were collected and placed in the <a href=\"http://ucjeps.berkeley.edu/\" target=\"_blank\">University and Jepson Herbaria</a>, many of which remain there today. Photographs of many distinct locations were taken, the locations of which were also recorded on topographic quads (unfortunately many of the original photos maps were lost). Finally, they created vegetation maps, drawing broad zones of single or mixed stands in colored pencil directly onto USGS topographic quads.</p>\n" +
    "\n" +
    "		<p>The project was originally designed to include detailed vegetation type maps of 220 USGS quadrangles, but the survey was halted by World War II, and only 23 maps were published. The project continued after the war under state funding, but no more quads were ever published. However, much of the unpublished data survived and currently exists in storage at the University of California, Berkeley, and other map libraries and research labs around California. (Wieslander 1961, Colwell 1977)</p>\n" +
    "\n" +
    "		<p>Due to the dataset's physical fragility it has been largely inaccessible to the broader scientific community. Therefore, researchers at <a href=\"http://ourenvironment.berkeley.edu\">U. C. Berkeley Department of Environmental Science, Policy, and Management (ESPM)</a>, in conjunction with the <a href=\"http://www.lib.berkeley.edu/BIOS/\">Marian Koshland Bioscience and Natural Resources Library</a>, sought funding to digitize all of the published and unpublished data to facilitate a broad distribution and to further its use in modern geographic information systems.</p>\n" +
    "\n" +
    "        <p>The VTM collection - vegetation maps, plot data, plot maps, and photographs were compiled, digitized, and are now being served as a complete collection via the new UC Berkeley <a href=\"http://holos.berkeley.edu/\" target=\"_blank\">HOLOS ecoengine</a>. The digitization of the parts of the collection was a multi-lab effort. The VTM photo digitization was led by the <a href=\"http://www.lib.berkeley.edu/BIOS/\" target=\"_blank\">Marian Koshland Bioscience and Natural Resources Library</a>, and is complete. The <a href=\"http://kellylab.berkeley.edu/\">Kelly Lab</a> in ESPM led the plot map digitization and georeferencing. The <a href=\"http://nature.berkeley.edu/allen-diazlab/\" target=\"_blank\">Allen-Diaz Lab</a> in ESPM led the entering all of the plot data, which the original surveyors recorded by hand, in the field, on thin sheets of paper in faint pencil. Researchers at the <a href=\"http://ice.ucdavis.edu/\" target=\"_blank\">Information Center for the Environment</a> at U. C. Davis led the digitization of all the unpublished vegetation maps.</p>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("about/about.photos.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.photos.tpl.html",
    "<div class=\"row\">\n" +
    "    <div class=\"col-sm-12\">\n" +
    "\n" +
    "	<h3>A Brief Summary of the Methods</h3>\n" +
    "\n" +
    "	<p>There are approximately 3,100 black and white landscape and stand scale photographs (9.2 x 13.6 cm) from 1920&ndash;1941, many of which are keyed to USGS topographical maps with the location of the photographer is written in red pen on the maps, with an arrow marking the vantage point and view of the photo. The photograph captions typically includes a description of the location and subject of the photograph including relevant genus and species, timber stand conditions, and examples of cultivation, grazing, logging, mining and fire, and quad name. The photographer, date of the photograph, and occasionally township and range are included.</p> \n" +
    "\n" +
    "	<p>Each photograph was scanned, and information from captions were entered into a database that is searchable by keyword (information from photograph caption) and genus, species. The location of each photograph depicted on an accompanying map USGS topographic map were georeferenced. The protocol, developed by the Berkeley Museum for Vertebrate Zoology, involves measuring the distance and bearing of each marked point from the known southwest corner and calculating its location.</p>\n" +
    "\n" +
    "   </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("about/about.plotdata.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.plotdata.tpl.html",
    "<div class=\"row\">\n" +
    "    <div class=\"col-sm-12\">\n" +
    "\n" +
    "		<p>The plot data consists of about 18,000 datasheets of recorded vegetation and environmental data from plots located throughout California and nearby areas of Nevada and Oregon. These plots were surveyed by the VTM field crews as a check on the vegetation polygons, and also to provide details on species composition, size and stand density of trees and shrubs and depth of leaf litter. Most plots were recorded in the 1930's and some as early as the 1920's. Much of the data was collected in timberland since the objective of the VTM project was to survey forest resources (<a target=\"_blank\" href=\"http://digitalassets.lib.berkeley.edu/vtm/ucb/text/cubio_vtm_fm.pdf\">Manual of Field Instructions for Vegetation Type Map of California</a>, p.1); however, plots were also located in non-timber forests and woodlands, shrublands, and grasslands. The plots cover a gradient of vegetation types and include data regarding tree stand structure (number per diameter class), percent cover of dominant overstory and understory vegetation by species, soil type, parent material, leaf litter, elevation, slope, aspect, parent material, and other environmental variables. All plot data was stored on paper data sheets, and individual plots were numbered according to U.S. Geological Survey (USGS) topographic quadrangle map name, quad section number and plot number. For more information on the plots, please see: <a href=\"/index.html#/about/citations\">Kelly et al. 2005 Madro&ntilde;o</a>.</p>\n" +
    "\n" +
    "		<h3>A Brief Summary of the Methods</h3>\n" +
    "\n" +
    "		<p>The Brush and Ground Cover plots were 2 x 0.5 chains in size (132 x 33ft or roughly 40 x 10m). VTM field biologists divided the rectangular plot into 100 equal sections and recorded the one herb or shrub species that was dominant in each subplot. They then calculated percent cover for each species by summing the number of subplots containing each dominant species. They also recorded the average height of each species and the depth of the litter.</p>\n" +
    "\n" +
    "		<p>Trees were sampled in a 1 chain wide strip whose center line coincided with one of the midline edges of the Brush and Ground Cover plot, thus Tree Tally plots were 2 x 1 chains in size (132 x 66ft or roughly 40 x 20m).  All trees with a DBH (diameter breast height) of at least 4\" were tallied by species into DBH size classes.</p>\n" +
    "\n" +
    "		<p>In addition to herb, shrub, and tree data, they also recorded: vegetation type, exposure, slope, year of last burn, soil depth and character, parent rock, site index (an index of soil productivity measured by estimating the height attainable by the average dominant trees at 300 years), additional ground cover species, and remarks about the plot.  A complete description of the methods for the plot data can be viewed in the VTM field manual <a target=\"_blank\" href=\"http://digitalassets.lib.berkeley.edu/vtm/ucb/text/cubio_vtm_fm.pdf\">Manual of Field Instructions for Vegetation Type Map of California</a>, by A.E. Wieslander.  VTM vegetation plots are referred to as \"Vegetation Type Sample Plots\" or just \"Sample Plots\" in VTM documents.</p>\n" +
    "\n" +
    "		<h3>Naming Conventions</h3>\n" +
    "\n" +
    "		<p>Each VTM plot map was divided into a grid, labeled alphabetically down the side and numerically across the top. The plots were numbered within each section of the grid, for example A13 for grid section A 1, plot 3. We assign each plot a unique identifier by prepending the quad number, i.e. 65A13 for quad 65, grid section A 1, plot 3.</p>\n" +
    "\n" +
    "		<h3>Entering the Data</h3>\n" +
    "\n" +
    "		<p>The plot datasheets were entered by the <a target=\"_blank\" href=\"http://nature.berkeley.edu/allen-diazlab/\">Allen-Diaz Lab</a> into an MS Access database developed by staff at the USDA Forest Service, Pacific Northwest Research Station, Forest Inventory and Analysis Program.  Each section on the datasheets corresponds to a field in the database.  The only field that does not occur on the datasheets is the Miscellaneous Notes field.  This field contains additional information about the datasheet that does not fall into one of the standard sections on the datasheet such as notes written on the margins, condition of the datasheet, or other noteworthy comments about the datasheet. </p>\n" +
    "\n" +
    "		<h3>Quality Control</h3>\n" +
    "\n" +
    "		<p>The VTM plot collection is a large dataset that required over a thousand data entry hours to transform almost 18,000 handwritten datasheets from the 1930's into a usable format for the public.  Needless to say, this enormous task also involved countless hours of quality control to find and correct data entry errors. We report error rates from quality assurance (QA) tests that should help users gauge the usefulness of the data for their own purposes.</p>\n" +
    "\n" +
    "		<p>To test the database for accuracy, we (the <a target=\"_blank\" href=\"http://nature.berkeley.edu/allen-diazlab/\">Allen-Diaz Lab</a>) randomly selected two non-overlapping samples of 100 plots from the collection and compared what was entered to what was written on the datasheets.  Each field in the database corresponds to a section on the datasheet.  We documented errors we found for each field so we could calculate a percent error per field.  Errors were counted if it resulted in an incorrect or missing value.  If what was written was slightly different than what was entered but did not change the meaning, it was not counted as an error.  For example, in the geographic location field, if \"1/2 mile\" was changed to \"0.5 mile\" it was not counted as an error.  Results from the QA tests are shown in the table below.</p>\n" +
    "\n" +
    "		<table class=\"table table-hover\">\n" +
    "			<colgroup id=\"col1\" span=\"1\"></colgroup>\n" +
    "			<colgroup id=\"col2\" span=\"3\"></colgroup>\n" +
    "			<tr>\n" +
    "				<th rowspan=\"2\">Field</th>\n" +
    "				<th colspan=\"3\">Random Subsample</th>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<th>First 100</th>\n" +
    "				<th>Second 100</th>\n" +
    "				<th>Total (all 200)</th>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Plot Number</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>1.0%</td>\n" +
    "				<td>0.5%</td>\n" +
    "			 </tr>\n" +
    "			 <tr>\n" +
    "				<td>Date</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "			 </tr>\n" +
    "			<tr>\n" +
    "				<td>Taken By</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>1.0%</td>\n" +
    "				<td>0.5%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Quadrangle</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Geographic Location</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>3.0%</td>\n" +
    "				<td>1.5%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Township</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Range</td>\n" +
    "				<td>1.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.5%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Section</td>\n" +
    "				<td>1.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.5%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Exposure</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "			</tr>\n" +
    "			<tr>	\n" +
    "				<td>Slope</td>\n" +
    "				<td>5.0%</td>\n" +
    "				<td>4.0%</td>\n" +
    "				<td>4.5%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Elevation</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>1.0%</td>\n" +
    "				<td>0.5%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Site Index</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>1.0%</td>\n" +
    "				<td>0.5%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Penetrability</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Year of Last Burn</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Special Fire Hazards</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>2.0%</td>\n" +
    "				<td>1.0%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Veg. Type</td>\n" +
    "				<td>0.6%</td>\n" +
    "				<td>2.8%</td>\n" +
    "				<td>1.7%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Ground Cover_Species Code</td>\n" +
    "				<td>2.0%</td>\n" +
    "				<td>2.7%</td>\n" +
    "				<td>2.4%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Ground Cover_% Cover</td>\n" +
    "				<td>0.9%</td>\n" +
    "				<td>1.4%</td>\n" +
    "				<td>1.1%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Ground Cover_Height (ft)</td>\n" +
    "				<td>0.5%</td>\n" +
    "				<td>0.5%</td>\n" +
    "				<td>0.5%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Ground Cover_Litter Depth (in)</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>1.0%</td>\n" +
    "				<td>0.5%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Additional Ground Cover	Spp.</td>\n" +
    "				<td>2.9%</td>\n" +
    "				<td>1.1%</td>\n" +
    "				<td>1.9%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Tree_Species Code</td>\n" +
    "				<td>1.6%</td>\n" +
    "				<td>4.4%</td>\n" +
    "				<td>2.7%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Tree_DBH</td>\n" +
    "				<td>0.8%</td>\n" +
    "				<td>2.9%</td>\n" +
    "				<td>1.9%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Tree_Total</td>\n" +
    "				<td>0%</td>\n" +
    "				<td>0%</td>\n" +
    "				<td>0%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Tree_Height (ft)</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>2.2%</td>\n" +
    "				<td>1.1%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Parent Rock</td>\n" +
    "				<td>11.0%</td>\n" +
    "				<td>11.0%</td>\n" +
    "				<td>11.0%</td>\n" +
    "			</tr>\n" +
    "		 	<tr>\n" +
    "		  		<td>Soil Origin</td>\n" +
    "		  		<td>3.0%</td>\n" +
    "		  		<td>1.0%</td>\n" +
    "				<td>2.0%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Soil Depth</td>\n" +
    "				<td>1.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.5%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Soil Character</td>\n" +
    "				<td>2.0%</td>\n" +
    "				<td>3.0%</td>\n" +
    "				<td>2.5%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Excessive Erosion Evidence</td>\n" +
    "				<td>1.0%</td>\n" +
    "				<td>0.0%</td>\n" +
    "				<td>0.5%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Remarks</td>\n" +
    "				<td>2.0%</td>\n" +
    "				<td>1.0%</td>\n" +
    "				<td>1.5%</td>\n" +
    "			</tr>\n" +
    "			<tr>\n" +
    "				<td>Misc Notes</td>\n" +
    "				<td>1.0%</td>\n" +
    "				<td>6.0%</td>\n" +
    "				<td>3.5%</td>\n" +
    "			</tr>\n" +
    "		</table>\n" +
    "\n" +
    "		<p>All errors in parent rock field were errors of omission, ie, no data was in the field when data were actually available.  In the slope field, 55% of the errors were errors of omission.  These occurred when the value on the datasheet was text rather than a numeric value.  These entries were left blank and the text was entered in the miscellaneous field.</p>\n" +
    "\n" +
    "		<h3>Database</h3>\n" +
    "\n" +
    "		<p>We converted the database Access to MySQL, a freely available and powerful database system.  This conversion was done to facilitate publishing the data in the various web tools and web browsing applications we have developed to analyze and display the data.  MySQL is well supported by other software critical to the development of these tools (Apache web server software, PHP and Perl programming languages, etc.).  Having the data in an SQL language compliant database also enhances the complexity of the searches we can conduct.  </p>\n" +
    "\n" +
    "		<p>The database for the VTM project is maintained at the <a target=\"_blank\" href=\"http://nature.berkeley.edu/sbcs\">College of Natural Resources Statistics and Bioinformatics Consulting Service </a>. </p>\n" +
    "\n" +
    "		<h3>Cautionary Notes</h3>\n" +
    "\n" +
    "		<p>Although we have taken great pains to ensure the accuracy of the data, there are some aspects of the data of which we feel the user should be aware.  Firstly, our objective in making the plot data available was simply to transcribe what was recorded on the VTM plot datasheets into a usable digital format.  We corrected obvious spelling errors, but we did not try to interpret ambiguous or possibly incorrect data recorded on the datasheets by the VTM field recorders.  We cannot make an estimate of the accuracy of the data recorded by the VTM personnel.</p>\n" +
    "\n" +
    "		<p>All species names in the plot database are consistent with the time period of the VTM data collection (mainly 1930's) during which time the first Jepson manual (Jepson 1925) was widely used in California.  Since that time many taxonomic changes have occurred along with the publications of the Munz manual (Munz and Keck 1968) and the second Jepson manual (Hickman 1993), among others.  It is important to understand that not all revisions are a straightforward replacement of the old name with the current name.  Taxonomic changes can also include lumping and splitting of taxa, changes in rank, and circumscription changes.  We did not update any of the names in the plot collection to current names.  We have provided a link in the <a target=\"_blank\" href ui-sref=\"data.plots\">plot data query tool</a> that provides historical synonyms, but users should be aware of the complexities of certain taxonomic changes and be judicious in their use. </p>\n" +
    "\n" +
    "		<p>There are some especially troublesome species codes that may provide a challenge to users of the plot data.  Sometimes the same species code in the VTM species lists can code for two different species.  For example, one of the species lists shows A2 as the code for <i>Agrostis sp</i>. as well as <i>Alnus rhombifolius</i>.  In cases such as these, the web site is designed to show all possible species names that apply to a code if more than one exists (<a target=\"_blank\" href ui-sref=\"about.faq\">an ambiguous species code</a>).  In another example, the code R was often used to denote the presence of rock, although R is also the code for <i>Sequoia sempervirens</i>.  Many of these cases can be decided by the user just by the location of the entry on the datasheet.  For example, if R is recorded in the tree tally section and has dbh values, then it is most certainly referring to the tree and not to rock.</p>\n" +
    "\n" +
    "		<p>Also, many species codes are different in slight but important ways which may have been overlooked by the data entry person or by the VTM field recorder.  If one letter or symbol of the code was incorrectly entered or recorded it could translate into a different species or an <a target=\"_blank\" href ui-sref=\"about.faq\">unidentified species code</a>.  For example, species codes for grasses were underlined.  During data entry those codes were entered with a 2 following the code to denote the underline.  If, for example, the data entry person did not notice that the code LP was underlined it would translate to <i>Pinus flexilis</i> (LP) instead of <i>Leptochloa sp</i>. (LP2).  Also, codes that depend on the case of the second letter can be problematic.  For instance, depending on the VTM recorder's handwriting it may be difficult to distinguish a lowercase l with the number 1, which again could lead to an incorrect translation from code to species name.  If the data entry person could not read the VTM field recorder's handwriting, the entry was entered as \"illegible\".</p>\n" +
    "\n" +
    "		<p>Many entries recorded in the Vegetation Type section of the plot datasheets are not the same as the mapped vegetation type on the corresponding Vegetation Type Map.  Most of the time the vegetation type was recorded in words, like \"Sagebrush\", which is straightforward; but VTM field recorders often recorded the vegetation type instead as a string of species codes, like \"AtrGr2\", to denote the dominant species in the area.  Atr is code for <i>Artemisia tridentata</i> and Gr2 is code for <i>Grass</i>, so in this case the database would show <i>Artemisia tridentata</i> and <i>Grass</i> as the entry for this plot.   These species codes would have been later interpreted by VTM personnel to fall into one of the vegetation types and the plot would have been mapped accordingly.  However, if a user queries the Vegetation Type field of the database for all the Sagebrush vegetation type plots, only the plots that actually have the word \"Sagebrush\" in the Type field would be included in the query results, even though the \"<i>Artemisia tridentata</i> and Grass\" plot may have been mapped as a Sagebrush type.  </p>\n" +
    "\n" +
    "		<p>The species code \"W\" or \"w\" is of special concern when it appears in the Vegetation Type field.  The lowercase w always follows an uppercase letter such as \"Dw\".  D is the code for Douglas fir (1930's name was <i>Pseudotsuga taxifolia</i>)*; and W is the code for <i>Quercus wislizenii</i>.  It appears that when used in the type field, W and w may sometimes refer to the species <i>Abies concolor</i> (species code W1).  We think this may be true because in some cases it is recorded in plots that 1) list W1 in the tree tally section and not W, and 2) these plots are also outside of the elevational range of <i>Quercus wislizenii</i>.  In other cases it does appear to code for <i>Quercus wislizenii</i>.  In either case, the database will translate W to <i>Quercus wislizenii</i> because we have found no documented source (no official VTM species list or other official VTM source) that W can also refer to <i>Abies concolor</i>.</p>\n" +
    "\n" +
    "		<p>Our task was to provide what was written on the datasheets in a digital format.  The type field as it exists may not be the best way to answer research questions about vegetation types, since the type field data on the datasheets is often in a raw species list format.  The order of the species codes listed in this field was important in translating to a vegetation type (<a target=\"_blank\" href=\"http://digitalassets.lib.berkeley.edu/vtm/ucb/text/cubio_vtm_fm.pdf\">Manual of Field Instructions for Vegetation Type Map of California</a>), and this was done by VTM personnel for the preparation of the Vegetation Type Map.  Therefore, data from existing digitized Vegetation Type Maps (digitization is currently in progress) are the best source of classifying vegetation of particular plots using the VTM method of classification.</p>\n" +
    "\n" +
    "		<p><small><sup>*</sup>D is the species code for <i>Quercus douglasii</i> in certain quadrangles, as is documented in quadrangle specific species lists.  When translating codes into species names, the database defers first to the quadrangle specific list if one exists, but not all quadrangles have their own species list.  All other codes come from global species lists, ie, official VTM species lists that are not particular to one specific quadrangle.</small></p>\n" +
    "\n" +
    "		<h3>Notes on Data Entry</h3>\n" +
    "		<ul>\n" +
    "		  <li>\n" +
    "		    <b>Illegible writing on datasheet</b>\n" +
    "		    <p>\n" +
    "		      In any field, if a word was not written legibly enough to understand, it was entered as \"(illegible word)\" (in parentheses or brackets) or \"illegible\", sometimes with a suggestion for what the word might mean.  For ex., if in the Excessive Erosion Evidence section the datasheet contained something like \"Shet erosion on hillsides\", where the \"Shet\" was written poorly enough that we could not even be certain that it was written as \"Shet\", the data enterer would enter \"(Illegible word, looks like \"Shet\") erosion on hillsides\" or \"(Illegible word, possibly \"Sheet\") erosion on hillsides\".  If the word was totally indecipherable the data enterer would enter \"(illegible word) erosion on hillsides\".\n" +
    "		    </p>\n" +
    "		  </li>\n" +
    "		  <li>\n" +
    "		    <b>Hyphens, blanks, and checkmarks</b>\n" +
    "		    <p>\n" +
    "		      In general, if a hyphen or checkmark was written on the datasheet it was entered as a hyphen (-) or, for checkmarks it was entered as \"check\" or \"checked\" or \"check mark\".  This rule is probably not entirely consistent, however.  Sections on the datasheet that were left blank, have a checkmark in them, or have a hyphen to indicate that no information was taken were sometimes left blank by the data enterers.\n" +
    "		    </p>\n" +
    "		  </li>\n" +
    "		  <li>\n" +
    "		    <b>Spelling errors</b>\n" +
    "		    <p>\n" +
    "		      If obvious spelling errors were found on datasheets (ie spelling errors made by VTM personnel) they were corrected during data entry. \n" +
    "		    </p>\n" +
    "		  </li>\n" +
    "		  <li>\n" +
    "		    <b>Blank datasheets and placeholder sheets</b>\n" +
    "		    <p>\n" +
    "		      All datasheets had a map number and plot number written on them, but some had very little or no other information recorded on them.  In these cases blank fields were left blank.  Sometimes instead of a datasheet a piece of paper (not a datasheet) had the map number and plot number and sometimes other remarks written on it, but no data.   We called these \"placeholders\", as they seemed to take the place of a  datasheet. They appear to be original VTM forms, because they are on the same type of paper and use the same typeset as other VTM datasheets.  We are not sure if these plots were ever sampled.  In any case, the data enterer entered all information written on the sheet.  The data enterer also noted in the Miscellaneous_Notes field that it was a placeholder sheet that did not have any data recorded on it.\n" +
    "		    </p>\n" +
    "		  </li>\n" +
    "		</ul>\n" +
    "\n" +
    "		<h3>Works Cited</h3>\n" +
    "		<ul>\n" +
    "			<li><a name=\"ref1\"></a>Hickman, James C. (editor),  1993.  <u>The Jepson Manual: Higher Plants of California</u>. Berkeley: University of California Press, 1400 pp.</li>\n" +
    "\n" +
    "			<li><a name=\"ref2\"></a>Jepson, Willis Linn, 1925.  <u>Manual of the Flowering Plants of California</u>. Berkeley: University of California Press, 1238 pp. </li>\n" +
    "\n" +
    "			<li><a name=\"ref3\"></a>Munz, Philip A. and David D. Keck, 1968.  <u>A California Flora and Supplement</u>.  Berkeley: University of California Press, 1681 pp.</li>\n" +
    "		</ul>	\n" +
    "\n" +
    "   </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("about/about.plotmaps.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.plotmaps.tpl.html",
    "<div class=\"row\">\n" +
    "    <div class=\"col-sm-12\">\n" +
    "\n" +
    "		<p>The VTM plot maps show the locations of all the individual plots surveyed by the original VTM crews. The points were stamped in red ink on USGS topographic maps that had been cut into eight or more segments, mounted on canvas, and folded, to facilitate use in the field. The plot map collection comprises fifteen minute (1:62500 scale) and thirty minute (1:125000 scale) quadrangles, primarily concentrated along the central and southern coastal ranges, and along the Sierras.</p>\n" +
    "\n" +
    "		<h3>Naming Conventions</h3>\n" +
    "		<p>Each VTM plot map was divided into a grid, labeled alphabetically down the side and numerically across the top.  The plots were numbered within each section of the grid, for example A13 for grid section A 1, plot 3.  We assign each plot a unique identifier by prepending the quad number, i.e. 65A13 for quad 65, grid section A 1, plot 3.</p>\n" +
    "\n" +
    "		<h3>Scanning</h3>\n" +
    "		<p>We scanned all VTM plot maps on an Epson Perfection flatbed scanner at 600 dpi.  We cropped and rotated the scans in Adobe Photoshop to prepare them for rectification.</p>\n" +
    "\n" +
    "		<h3>Georeferencing</h3>\n" +
    "		<p>The original VTM surveyors marked the plot locations on USGS topographic maps, which have a polyconic projection centered at the center of the map (Birdseye 1928).  We first registered the historic uncut maps of the same vintage as the VTM cut maps to modern maps (1:24,000-scale USGS Digital Raster Graphic digital images of modern USGS quadrangles) of a known projection and coordinate system using stable tie points such as roads and peaks. We used between eight and 16 tie points per map. Next, the uncut scanned VTM maps were georeferenced to the georeferenced historic uncut maps using common map features as the tie points. We used a minimum of six tie points per segment and first order polynomial transformations for each step. Average RMSE for the process was around 60 m. All plot locations were digitized manually and their location attributed to the plot ID.</p>\n" +
    "\n" +
    "		<h3>Error</h3>\n" +
    "		<p>Geospatial data is of little value without some knowledge of the spatial uncertainty or error associated with it, and this is especially true of historical geospatial data.  Spatial error in the VTM plot maps begins with the USGS topographic maps the original surveyors used to mark their plots.  We were unable to discover any USGS standards in spatial uncertainty prior to the <a href=\"http://rockyweb.cr.usgs.gov/nmpstds/nmas647.html\">National Map Accuracy Standards</a> (NMAS) of 1947, so we have assumed that maps produced before then are at most as accurate.  The USGS DRGs that we used as a reference when georeferencing the historical maps do follow the NMAS, and thus contribute about 20.32 m.</p>\n" +
    "		<p>The VTM surveyors also introduced uncertainty in marking their plots on the maps.  This is impossible to quantify since no one who might have remembered the locations of individual plots in the field is still alive.  Instead, we use the size of the red circle as a proxy.  We know that the size of the circle was not intended for this use, but we think it represents a maximum degree of error in the placement of the plot on the map.  We selected plots at random from the set of georeferenced maps in December of 2004, 20 from the 30' maps and 20 from 15' maps, and averaged the radii of their red circles.  15' plots had an average circle radius of 112.46 m, and 30' plots had an average circle radius of 215.73 m.</p>\n" +
    "		<p>The process of rectification also introduces error, but it does so in a quantifiable way.  We recorded the total root mean squared (RMS) error for each rectification event (each base map, each VTM plot section).  This was highly variable for the base maps, but amounted to about 2 pixels on average for the VTM plot sections.</p>\n" +
    "		<p>We gauged error in manually digitizing each plot point by testing technicians involved in the georeferencing process for their ability to place single pixel at the center of a circle 39 pixels in diameter, the approximate size of the plot circle on a scanned VTM plot section.  We measured the Euclidian distance of their point relative to the true center of the circle, averaged the error across technicians, and converted to meters for 30' and 15' maps.</p>\n" +
    "		<p>We combined all sources of error by taking root of the sum of the squared error from all sources, as per Thapa and Bossler 1992<sup><a href=\"#/about/plotmaps#ref2\">2</a></sup>.  Since each individual plot section has its own error, this means that all the plot points on a particular VTM plot section have the same error value.</p>\n" +
    "\n" +
    "		<h3>Works Cited</h3>\n" +
    "		<ul>\n" +
    "			<li><a name=\"ref1\"></a>Birdseye, C.H.  <u>Topographic Instructions of the United States Geological Survey</u>.  Washington: United States Government Printing Office, 1928.</li>\n" +
    "			<li><a name=\"ref2\"></a>Thapa, Khagendra and John Bossler.  \"Accuracy of Spatial Data Used in Geographic Information Systems.\"  <u>Photogrammetric Engineering and Remote Sensing</u> 58:6 (1992): 835-841.</li>\n" +
    "		</ul>	\n" +
    "\n" +
    "   </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("about/about.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.tpl.html",
    "<div class=\"container\" id=\"learn-more\" ng-controller=\"AboutCtrl\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-md-12\">\n" +
    "			<h3>\n" +
    "				<span class=\"title\">{{pageTitle | split:'|':0}}</span>\n" +
    "			</h3>\n" +
    "			<h5 class=\"sub-nav-links\">\n" +
    "				<a href ui-sref=\"about.overview\">History</a> |\n" +
    "				<a href ui-sref=\"about.description\">Data Description</a> |\n" +
    "				<a href ui-sref=\"about.metadata\">Metadata</a> |\n" +
    "				<a href ui-sref=\"about.faq\">FAQ</a> |\n" +
    "				<a href ui-sref=\"about.bibliography\">Bibliography</a> |\n" +
    "				<a href ui-sref=\"about.citations\">Suggested Citations</a>\n" +
    "			</h5>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <hr/>\n" +
    "    <div ui-view></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("about/about.vegmaps.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.vegmaps.tpl.html",
    "<div class=\"row\">\n" +
    "    <div class=\"col-sm-12\">\n" +
    "\n" +
    "	<h3>A Brief Summary of the Methods</h3>\n" +
    "	<p>Dominant vegetation type maps were mapped with a minimum mapping unit (MMU) of 16 ha by direct observation &ldquo;from ridges, peaks, and other vantage points&rdquo; (Wieslander 1935) in the field by VTM crews, directly upon 15-minute (1: 62,500-scale) topographic quadrangles, and supplemented by sample plots (which are described below) (Wieslander 1935). According to his reports, it took a two-man crew from six to eight weeks to complete the fieldwork for a 15-minute quad of about 6,070 ha (Wieslander 1935).  The vegetation mapping scheme was driven by &ldquo;the dominant vegetation visible externally&rdquo; (Wieslander 1935), in other words, by overstory species recognition, and included &ldquo;mosaic types&rdquo; - complex vegetation conditions that resulted from fire or other disturbances, and pure and mixed stand conditions which they associated with &ldquo;natural plant associations&rdquo; (Wieslander 1935).</p>\n" +
    "\n" +
    "	<p>The VTM vegetation maps were mostly found in the Marian Koshland Library archives, although the collection was also distributed in various labs and libraries around the state.  As many of the maps as could be found were gathered and brought to UC Davis for digitization by Dr. James Thorne.  The VTM vegetation maps were scanned at 300 dpi, one cut segment at a time, and the scanned versions of the VTM tiles corresponding to each topographic map were then registered to the topographic base map. Once the VTM images were georeferenced, vegetation polygons were traced and plant species codes in each polygon were transcribed. The original VTM plant species codes were linked to modern plant scientific names, and the sequence of species in each polygon was assigned to vegetation and habitat types. The project used the Manual of California Vegetation Types (Sawyer and Keeler&ndash;Wolf 1995), and the California Wildlife Habitat Relationships Models (WHR) (California Department of Fish and Game 2004) for land cover classifications. Once these attributes were added to the maps, they were then error&ndash;checked and finalized.</p>\n" +
    "\n" +
    "	<h3>Works Cited</h3>\n" +
    "	<p>See <a href=\"/index.html#about/bibliography\">Wieslander Bibliography</a></p>\n" +
    "\n" +
    "   </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("data/data.legend.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/data.legend.tpl.html",
    "<div class=\"modal-body\">\n" +
    "    <div class='vtm-legend'>\n" +
    "        <div class='legend-title'>VTM Vegetation Map Legend</div>\n" +
    "        <div class='legend-scale'>\n" +
    "          <ul class='legend-labels'>\n" +
    "            <li><span style='background:#FFFFFF;'></span>Alpine</li>\n" +
    "            <li><span style='background:#F3EACF;'></span>Barren</li>\n" +
    "            <li><span style='background:#E1E298;'></span>Cropland</li>\n" +
    "            <li><span style='background:#DFC098;'></span>Dessert southwest shrub</li>\n" +
    "            <li><span style='background:#53A379;'></span>Evergreen forest</li>\n" +
    "            <li><span style='background:#FCEBA8;'></span>Grassland &amps; herbaceous</li>\n" +
    "            <li><span style='background:#A3CAC2;'></span>Herbaceous wetland</li>\n" +
    "            <li><span style='background:#64547C;'></span>High intensity development</li>\n" +
    "            <li><span style='background:#BDDFFF;'></span>Open water</li>\n" +
    "            <li><span style='background:#C9DD9F;'></span>Orchard &amps; vineyard</li>\n" +
    "            <li><span style='background:#53A379;'></span>Other forest</li>\n" +
    "            <li><span style='background:#F3F3A4;'></span>Pasture/Hay</li>\n" +
    "            <li><span style='background:#8EB092;'></span>Shrub</li>\n" +
    "            <li><span style='background:#75B092;'></span>Woody wetland</li>\n" +
    "            <li><span style='background:#000000;'></span>Unknown</li>\n" +
    "          </ul>\n" +
    "        </div>\n" +
    "        <div class='legend-source'>Source: <a href=\"http://landcover.usgs.gov/classes.php\">NLCD 92 Land Cover Class Definitions</a></div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<style type='text/css'>\n" +
    "  .vtm-legend .legend-title {\n" +
    "    text-align: left;\n" +
    "    margin-bottom: 5px;\n" +
    "    font-weight: bold;\n" +
    "    font-size: 90%;\n" +
    "    }\n" +
    "  .vtm-legend .legend-scale ul {\n" +
    "    margin: 0;\n" +
    "    margin-bottom: 5px;\n" +
    "    padding: 0;\n" +
    "    float: left;\n" +
    "    list-style: none;\n" +
    "    }\n" +
    "  .vtm-legend .legend-scale ul li {\n" +
    "    font-size: 80%;\n" +
    "    list-style: none;\n" +
    "    margin-left: 0;\n" +
    "    line-height: 18px;\n" +
    "    margin-bottom: 2px;\n" +
    "    }\n" +
    "  .vtm-legend ul.legend-labels li span {\n" +
    "    display: block;\n" +
    "    float: left;\n" +
    "    height: 16px;\n" +
    "    width: 30px;\n" +
    "    margin-right: 5px;\n" +
    "    margin-left: 0;\n" +
    "    }\n" +
    "  .vtm-legend .legend-source {\n" +
    "    font-size: 70%;\n" +
    "    color: #999;\n" +
    "    clear: both;\n" +
    "    }\n" +
    "  .vtm-legend a {\n" +
    "    color: #777;\n" +
    "    }\n" +
    "</style>\n" +
    "");
}]);

angular.module("data/data.overview.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/data.overview.tpl.html",
    "<div class=\"row\">\n" +
    "    <div class=\"item col-md-4 col-sm-4 col-xs-12 text-center\">\n" +
    "        <div class=\"features\">\n" +
    "            <a href ui-sref=\"data.vegetation\">\n" +
    "                <div class=\"icon animated fadeIn delayp1\" style=\"opacity: 0;\">\n" +
    "                    <img class=\"img-circle\" src=\"assets/img/data_vegpolygons.png\" />\n" +
    "                </div><!--//icon-->\n" +
    "                <div class=\"content\">\n" +
    "                    <h2 class=\"title\">Vegetation</h2>\n" +
    "                    <p>Learn more about this data set. </p>  \n" +
    "                </div><!--//content-->  \n" +
    "            </a>        \n" +
    "        </div>     \n" +
    "    </div>\n" +
    "    <div class=\"item col-md-4 col-sm-4 col-xs-12 text-center\">\n" +
    "        <div class=\"features\">\n" +
    "            <a href ui-sref=\"data.plots\">\n" +
    "                <div class=\"icon animated fadeIn delayp1\" style=\"opacity: 0;\">\n" +
    "                    <img class=\"img-circle\" src=\"assets/img/data_plots.png\" />\n" +
    "                </div><!--//icon-->\n" +
    "                <div class=\"content\">\n" +
    "                    <h2 class=\"title\">Plot Data</h2>\n" +
    "                    <p>Learn more about this data set. </p>  \n" +
    "                </div><!--//content--> \n" +
    "            </a>    \n" +
    "        </div>           \n" +
    "    </div>\n" +
    "    <div class=\"item col-md-4 col-sm-4 col-xs-12 text-center\">\n" +
    "        <div class=\"features\">\n" +
    "            <a href ui-sref=\"data.photos\">\n" +
    "                <div class=\"icon animated fadeIn delayp1\" style=\"opacity: 0;\">\n" +
    "                    <img class=\"img-circle\" src=\"assets/img/data_photolocations.png\" />               \n" +
    "                </div><!--//icon-->\n" +
    "                <div class=\"content\">\n" +
    "                    <h2 class=\"title\">Photos</h2>\n" +
    "                    <p>Learn more about this data set. </p>   \n" +
    "                </div><!--//content-->  \n" +
    "            </a>\n" +
    "        </div>              \n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("data/data.photos.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/data.photos.tpl.html",
    "<div class=\"row\" >\n" +
    "    <div class=\"col-md-12\" >\n" +
    "        <div class=\"tool-wrapper\">\n" +
    "\n" +
    "                    <div class=\"map-layer-controls\">\n" +
    "                        <ul >\n" +
    "                            <li custom-layer-control icon=\"fa fa-circle\" layer=\"plots\">\n" +
    "                            <li custom-layer-control icon=\"fa fa-camera\" layer=\"photos\">\n" +
    "                            <li custom-layer-control icon=\"fa fa-leaf\" layer=\"veg\">\n" +
    "                        </ul>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"map-legend-controls\">\n" +
    "                        <ul >\n" +
    "                            <li custom-legend-control>\n" +
    "                        </ul>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"map-popup\" >\n" +
    "                        <ng-include src=\"'data/data.popup.tpl.html'\">\n" +
    "                        </ng-include>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <leaflet id=\"map\" center=\"map.center\" layers=\"map.layers\" defaults=\"map.defaults\" controls=\"map.controls\" markers=\"map.markers\"  geojson=\"map.geojson\" bounds=\"map.bounds\">\n" +
    "                    </leaflet>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    \n" +
    "</div>\n" +
    "<div class=\"row\" style=\"margin-top:15px;\">\n" +
    "    <div class=\"col-md-12\">\n" +
    "        <tabset>\n" +
    "            <tab heading=\"General Information\">\n" +
    "                <p>	There are approximately 3,100 black and white landscape and stand scale photographs from 1920&ndash;1941 keyed to USGS topographical maps. The photograph captions typically includes a description of the location and subject of the photograph including relevant genus and species, timber stand conditions, and examples of cultivation, grazing, logging, mining and fire, and quad name. The photographer, date of the photograph, and occasionally township and range are included. The photographs and locations and associated data can be downloaded (see Download Tab).</p>\n" +
    "                <p><a href ui-sref=\"about.description\">Read more about the digitization method</a></p>\n" +
    "            </tab>\n" +
    "            <tab heading=\"Download\">\n" +
    "                <p>We are working on providing scans of the original photo datasheets and a Historical Photo Hunt app. In the meantime photographs can be downloaded from <a href=\"http://www.lib.berkeley.edu/BIOS/vtm\" target=\"_blank\">Marian Koshland Bioscience and Natural Resources Library</a>.</p>\n" +
    "            </tab>\n" +
    "            <tab heading=\"Suggested Citations\">\n" +
    "                <ng-include src=\"'about/about.citations.tpl.html'\"></ng-inlcude>\n" +
    "            </tab>\n" +
    "        </tabset>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("data/data.plots.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/data.plots.tpl.html",
    "<div class=\"row\" >\n" +
    "	<div class=\"col-md-12\" >\n" +
    "		<div class=\"tool-wrapper\">\n" +
    "\n" +
    "					<div class=\"map-layer-controls\">\n" +
    "						<ul >\n" +
    "							<li custom-layer-control icon=\"fa fa-circle\" layer=\"plots\">\n" +
    "							<li custom-layer-control icon=\"fa fa-camera\" layer=\"photos\">\n" +
    "							<li custom-layer-control icon=\"fa fa-leaf\" layer=\"veg\">\n" +
    "						</ul>\n" +
    "					</div>\n" +
    "\n" +
    "					<div class=\"map-legend-controls\">\n" +
    "                        <ul >\n" +
    "                            <li custom-legend-control>\n" +
    "                        </ul>\n" +
    "                    </div>\n" +
    "\n" +
    "					<div class=\"map-popup\" >\n" +
    "                        <ng-include src=\"'data/data.popup.tpl.html'\">\n" +
    "                        </ng-include>\n" +
    "                    </div>\n" +
    "\n" +
    "					<leaflet id=\"map\" center=\"map.center\" layers=\"map.layers\" defaults=\"map.defaults\" controls=\"map.controls\" markers=\"map.markers\"  geojson=\"map.geojson\" bounds=\"map.bounds\">\n" +
    "					</leaflet>\n" +
    "\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "	\n" +
    "</div>\n" +
    "<div class=\"row\" style=\"margin-top:15px;\">\n" +
    "	<div class=\"col-md-12\">\n" +
    "		<tabset>\n" +
    "			<tab heading=\"General Information\">\n" +
    "				<p>There are approximately 18,000 VTM plots statewide, concentrated along the central and southern coastal ranges, and along the Sierra Nevada. These plot locations and their associate attributes can be downloaded (see Download Tab).</p>\n" +
    "				<p><a href ui-sref=\"about.description\">Read more about the digitization method</a></p>\n" +
    "				<p><a href ui-sref=\"about.metadata\">Read more about the attribute data</a></p>\n" +
    "			</tab>\n" +
    "			<tab heading=\"Download\">\n" +
    "				<p> \n" +
    "					Download zip file containing Plot Data for CA\n" +
    "					<a class=\"btn btn-large btn-download-icon\" href=\"https://github.com/berkeley-gif/vtm-plotsdata/archive/master.zip\" onclick=\"var that=this;_gaq.push(['_trackEvent','Download','PlotsZIP',this.href]);setTimeout(function(){location.href=that.href;},400);return false;\">\n" +
    "						<i class=\"fa fa-arrow-circle-down\"></i>					\n" +
    "					</a>\n" +
    "				</p>\n" +
    "				<p>We are working on providing scans of the original plot maps.</p>\n" +
    "			</tab>\n" +
    "			<tab heading=\"Suggested Citations\">\n" +
    "				<ng-include src=\"'about/about.citations.tpl.html'\"></ng-inlcude>\n" +
    "			</tab>\n" +
    "		</tabset>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("data/data.popup.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/data.popup.tpl.html",
    "<span ng-hide=\"results.quads.length\">Click feature for more information.</span>\n" +
    "<div class=\"info-box\" ng-show=\"results.quads.length\" ng-cloak>\n" +
    "    <div >\n" +
    "        County:\n" +
    "            <span ng-repeat=\"county in results.counties\" repeat-delimiter=\",\">\n" +
    "            {{ county.properties.name }}\n" +
    "            </span>\n" +
    "    </div>\n" +
    "    <div>\n" +
    "        VTM Quads:\n" +
    "            <span ng-repeat=\"quad in results.quads\" repeat-delimiter=\",\">\n" +
    "            {{ quad.properties.record | split:':':1 }}\n" +
    "            </span>\n" +
    "    </div>\n" +
    "    <div ng-show=\"results.veg.length\">\n" +
    "        Veg:\n" +
    "            <span ng-repeat=\"veg in results.veg\" repeat-delimiter=\",\">\n" +
    "            {{ veg.whr }}\n" +
    "            <a target=\"_blank\" ng-href=\"{{veg.url}}\" ><i class=\"fa fa-info-circle\"></i></a>\n" +
    "            </span>\n" +
    "    </div>\n" +
    "    <div ng-show=\"results.plots.length\">\n" +
    "        Plots:\n" +
    "            <span ng-repeat=\"plot in results.plots\" repeat-delimiter=\",\">\n" +
    "            {{ plot.plot_no }}\n" +
    "            <a target=\"_blank\" ng-href=\"{{plot.url}}\" ><i class=\"fa fa-info-circle\"></i></a>\n" +
    "            </span>\n" +
    "    </div>\n" +
    "        <div ng-show=\"results.photos.length\">\n" +
    "        Photos:\n" +
    "        <div ng-repeat=\"photo in results.photos\">\n" +
    "            <div class=\"wrap-image\">\n" +
    "                <a target=\"_blank\" ng-href=\"{{photo.url}}\">\n" +
    "                <img ng-src=\"{{photo.media_url | thumbnailUrl}}\" alt=\"\"\n" +
    "                style=\"position: absolute;\" resizable-image >\n" +
    "                </a>\n" +
    "                <div class=\"tools tools-bottom\">\n" +
    "                {{photo.authors}}, {{photo.begin_date | date:'yyyy'}} <br/>\n" +
    "                {{photo.county}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("data/data.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/data.tpl.html",
    "<div class=\"container\" id=\"data-grid\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-md-12\">\n" +
    "			<h3>\n" +
    "				<span class=\"title\">{{pageTitle | split:'|':0}}</span>\n" +
    "			</h3>\n" +
    "			<h5 class=\"sub-nav-links\">\n" +
    "				<a href ui-sref=\"data.vegetation\">Vegetation</a> |\n" +
    "				<a href ui-sref=\"data.plots\">Plot Data</a> |\n" +
    "				<a href ui-sref=\"data.photos\">Photo Locations</a>\n" +
    "			</h5>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <hr/>\n" +
    "    <div ui-view style=\"height:100%;\"></div>\n" +
    "</div>");
}]);

angular.module("data/data.vegetation.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/data.vegetation.tpl.html",
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"col-md-12\" >\n" +
    "        <div class=\"tool-wrapper\">\n" +
    "\n" +
    "                    <div class=\"map-layer-controls\">\n" +
    "                        <ul >\n" +
    "                            <li custom-layer-control icon=\"fa fa-circle\" layer=\"plots\">\n" +
    "                            <li custom-layer-control icon=\"fa fa-camera\" layer=\"photos\">\n" +
    "                            <li custom-layer-control icon=\"fa fa-leaf\" layer=\"veg\">\n" +
    "                        </ul>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"map-legend-controls\">\n" +
    "                        <ul >\n" +
    "                            <li custom-legend-control>\n" +
    "                        </ul>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"map-popup\" >\n" +
    "                        <ng-include src=\"'data/data.popup.tpl.html'\">\n" +
    "                        </ng-include>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <leaflet id=\"map\" center=\"map.center\" layers=\"map.layers\" defaults=\"map.defaults\" controls=\"map.controls\" markers=\"map.markers\"  geojson=\"map.geojson\" bounds=\"map.bounds\">\n" +
    "                    </leaflet>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    \n" +
    "</div>\n" +
    "<div class=\"row\" style=\"margin-top:15px;\">\n" +
    "    <div class=\"col-md-12\">\n" +
    "        <tabset>\n" +
    "            <tab heading=\"General Information\">\n" +
    "				<p>Dominant vegetation type maps were mapped with a minimum mapping unit of 16 ha by direct observation. The vegetation mapping scheme was driven by overstory species recognition, and included \"mosaic types\" - complex vegetation conditions that resulted from fire or other disturbances, and pure and mixed stand conditions which they associated with \"natural plant associations\". The vegetation polygons and associated data can be downloaded (see Download Tab).</p>\n" +
    "                <p><a href ui-sref=\"about.description\">Read more about the digitization method</a></p>\n" +
    "            </tab>\n" +
    "            <tab heading=\"Download\">\n" +
    "                <p> \n" +
    "                    Download shapefile containing Vegetation polygons for CA\n" +
    "                    <a class=\"btn btn-large btn-download-icon\" href=\"https://ecoengine.berkeley.edu/data/Wieslander_Statewide_CANAD83.zip\" onclick=\"var that=this;_gaq.push(['_trackEvent','Download','VegZIP',this.href]);setTimeout(function(){location.href=that.href;},400);return false;\">\n" +
    "                        <i class=\"fa fa-arrow-circle-down\"></i>                 \n" +
    "                    </a>\n" +
    "                </p>\n" +
    "                <p>We are working on providing scans of the original vegetation maps.</p>\n" +
    "            </tab>\n" +
    "            <tab heading=\"Suggested Citations\">\n" +
    "                <ng-include src=\"'about/about.citations.tpl.html'\"></ng-inlcude>\n" +
    "            </tab>\n" +
    "        </tabset>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("data/popup/photos.popup.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/popup/photos.popup.tpl.html",
    "<ul>\n" +
    "	<li><b>{{layerProp.record}}</b></li>\n" +
    "	<li><i>Authors:</i> {{layerProp.authors}}</li>\n" +
    "	<li><i>Date:</i> {{layerProp.begin_date | date:\"shortDate\"}}</li>\n" +
    "	<li><i>Notes:</i> {{layerProp.notes}}</li>\n" +
    "	<li><i>Observations:</i>\n" +
    "		<span ng-hide=\"layerProp.observations.length\">\n" +
    "        	&nbsp;No data\n" +
    "		</span>\n" +
    "		<ul ng-show=\"layerProp.observations.length\">\n" +
    "        	<li ng-repeat=\"obs in layerProp.observations\">\n" +
    "            	<a ng-href=\"{{obs.url}}\" target=\"_blank\">{{obs.scientific_name}}</a>\n" +
    "        	</li>\n" +
    "		</ul>\n" +
    "	</li>\n" +
    "	<li><i>More details</i> <a ng-href=\"{{layerProp.url}}\" target=\"_blank\"><i class=\"fa fa-info-circle\"></i></a></li>\n" +
    "</ul>");
}]);

angular.module("data/popup/plots.popup.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/popup/plots.popup.tpl.html",
    "<ul>\n" +
    "	<li>Plot Number:{{layerProp.plot_no}}</li>\n" +
    "	<li>Plot Map: {{layerProp.map_reference}}</li>\n" +
    "	<li>Quadrangle: {{layerProp.quadrangle}}</li>\n" +
    "	<li>TRS: {{layerProp.trs}}</li>\n" +
    "	<li>Locality: {{layerProp.locality}}</li>\n" +
    "	<li>Date: {{layerProp.begin_date | date:\"shortDate\"}}</li>\n" +
    "	<li>Coordinates: {{layerProp.geojson.coordinates[0]}}, {{layerProp.geojson.coordinates[1]}}</li>\n" +
    "	<li>Coordinate uncertainty (mt): {{layerProp.coordinate_uncertainty_in_meters}}</li>\n" +
    "	<li>Elevation: {{layerProp.elevation}}</li>\n" +
    "	<li>Penetrability: {{layerProp.penetrability}}</li>\n" +
    "	<li>Taken by: {{layerProp.taken_by}}</li>\n" +
    "	<li>Slope (%): {{layerProp.slope_percent}}</li>\n" +
    "	<li>Trees:\n" +
    "		<span ng-hide=\"layerProp.trees.length\">\n" +
    "        	&nbsp;No data\n" +
    "		</span>\n" +
    "		<ul ng-show=\"layerProp.trees.length\">\n" +
    "        	<li ng-repeat=\"obs in layerProp.trees\">\n" +
    "            	<a ng-href=\"{{obs.url}}\" target=\"_blank\">{{obs.scientific_name}}</a>\n" +
    "        	</li>\n" +
    "		</ul>\n" +
    "	</li>\n" +
    "	<li>Brushes:\n" +
    "		<span ng-hide=\"layerProp.brushes.length\">\n" +
    "        	&nbsp;No data\n" +
    "		</span>\n" +
    "		<ul ng-show=\"layerProp.brushes.length\">\n" +
    "        	<li ng-repeat=\"obs in layerProp.brushes\">\n" +
    "            	<a ng-href=\"{{obs.url}}\" target=\"_blank\">{{obs.scientific_name}}</a>\n" +
    "        	</li>\n" +
    "		</ul>\n" +
    "	</li>\n" +
    "	<li>More details <a ng-href=\"{{layerProp.url}}\" target=\"_blank\"><i class=\"fa fa-info-circle\"></i></a></li>\n" +
    "</ul>");
}]);

angular.module("data/popup/vegetation.popup.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/popup/vegetation.popup.tpl.html",
    "<ul>\n" +
    "	<li><i>WHR:</i> {{layerProp.whr}}</li>\n" +
    "	<li><i>Primary species:</i> {{layerProp.primary_species}}</li>\n" +
    "	<li><i>MCV:</i> {{layerProp.mcv}}</li>\n" +
    "	<li><i>Notes:</i> {{layerProp.notes}}</li>\n" +
    "	<li><i>Observations:</i>\n" +
    "		<span ng-hide=\"layerProp.observations.length\">\n" +
    "        	&nbsp;No data\n" +
    "		</span>\n" +
    "		<ul ng-show=\"layerProp.observations.length\">\n" +
    "        	<li ng-repeat=\"obs in layerProp.observations\">\n" +
    "            	<a ng-href=\"{{obs.url}}\" target=\"_blank\">{{obs.scientific_name}}</a>\n" +
    "        	</li>\n" +
    "		</ul>\n" +
    "	</li>\n" +
    "	<li><i>More details</i> <a ng-href=\"{{layerProp.url}}\" target=\"_blank\"><i class=\"fa fa-info-circle\"></i></a></li>\n" +
    "</ul>");
}]);

angular.module("home/home.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("home/home.tpl.html",
    "<div class=\"container\" id=\"home\" ng-controller=\"HomeCtrl\">\n" +
    "    <div class=\"fullwidthbanner-container\">\n" +
    "        <div class=\"banner\">\n" +
    "            <div>\n" +
    "                <animated-banner ng-model=\"image\">\n" +
    "                    <img ng-src=\"{{ image.source }}\"\n" +
    "                        alt=\"{{ image.text }}\" />\n" +
    "                </animated-banner>\n" +
    "            </div> \n" +
    "        </div> <!-- end banner -->\n" +
    "    </div>\n" +
    "    <div id=\"title-box\">\n" +
    "        <p><span class=\"title\"><span class=\"title-first-letter\">W</span>IESLANDER <span class=\"title-first-letter\">V</span>EGETATION <span class=\"title-first-letter\">T</span>YPE <span class=\"title-first-letter\">M</span>APPING</span></p>\n" +
    "    </div>\n" +
    "    <div id=\"description-box\">\n" +
    "        <div class=\"row\">\n" +
    "                <div class=\"col-sm-3\">\n" +
    "                    <div id=\"portrait\">\n" +
    "                        <img  src=\"assets/img/wieslander.png\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"col-sm-9\" > \n" +
    "                    <div id=\"tagline\">\n" +
    "						<p>In the 1920s and 1930s Albert Everett Wieslander and several others explored much of California's wilderness sampling vegetation, taking photographs, collecting plant specimens, and drawing detailed maps of what they found. These data represent a snapshot of California's vegetation in the early 20th century, and are a valuable resource for comparative and conservation ecology. This website has more information about the collection, detailed information about using the data, and data downloads.</p>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"item col-md-4 col-sm-4 col-xs-12 text-center\">\n" +
    "            <div class=\"features\">\n" +
    "                <a href ui-sref=\"data.overview\">\n" +
    "                    <div class=\"icon animated fadeIn delayp1\" style=\"opacity: 0;\">\n" +
    "                        <i class=\"fa fa-cloud-download\"></i>                \n" +
    "                    </div><!--//icon-->\n" +
    "                    <div class=\"content\">\n" +
    "                        <h2 class=\"title\">Explore Data</h2>\n" +
    "                        <p>View and download vegetation maps, plot data and photos. </p>  \n" +
    "                    </div><!--//content-->  \n" +
    "                </a>        \n" +
    "            </div>     \n" +
    "        </div>\n" +
    "        <div class=\"item col-md-4 col-sm-4 col-xs-12 text-center\">\n" +
    "            <div class=\"features\">\n" +
    "                <a href ui-sref=\"about.overview\">\n" +
    "                    <div class=\"icon animated fadeIn delayp1\" style=\"opacity: 0;\">\n" +
    "                        <i class=\"fa fa-info-circle\"></i>                \n" +
    "                    </div><!--//icon-->\n" +
    "                    <div class=\"content\">\n" +
    "                        <h2 class=\"title\">Learn More</h2>\n" +
    "                        <p>Learn more about Wieslander's Vegetation Type Mapping project. </p>  \n" +
    "                    </div><!--//content--> \n" +
    "                </a>      \n" +
    "            </div>           \n" +
    "        </div>\n" +
    "        <div class=\"item col-md-4 col-sm-4 col-xs-12 text-center\">\n" +
    "            <div class=\"features\">\n" +
    "                <a href ui-sref=\"howto.overview\">\n" +
    "                    <div class=\"icon animated fadeIn delayp1\" style=\"opacity: 0;\">\n" +
    "                        <i class=\"fa fa-user\"></i>                \n" +
    "                    </div><!--//icon-->\n" +
    "                    <div class=\"content\">\n" +
    "                        <h2 class=\"title\">How To</h2>\n" +
    "                        <p>View usage guidelines and learn how you can use this data. </p>  \n" +
    "                    </div><!--//content-->  \n" +
    "                </a>  \n" +
    "            </div>              \n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("howto/howto.overview.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("howto/howto.overview.tpl.html",
    "<div class=\"row\">\n" +
    "    <div class=\"col-sm-12\">\n" +
    " 	 	<p><blockquote>VTM is &ldquo;the most ambitious attempt ever made to describe the complex vegetation of California&rdquo;.<small>Critchfield, 1971</small></blockquote></p> \n" +
    "    </div>    \n" +
    "</div>\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"col-sm-12\">\n" +
    " 	 	<h3>\n" +
    "		  Using the HOLOS API\n" +
    "		</h3>\n" +
    "		<p>Parts of the VTM collection have been used in scientific research since the mid 1940's, however the data and their utility continue to expand. The vegetation maps have been used to understand legacies of land use change and plan for the future on broad scales. The plot data have been used to examine changes to chaparral and forest communities around the state by relocating and resurveying plots as well as by comparing modern vegetation plot data to predict changes in community structure under a changing climate. Some of the photographs have been reshot, and used to understand changing vegetation structure.</p>\n" +
    "		<p>The VTM website is currently hosted under the frame of the <a href=\"https://ecoengine.berkeley.edu\" target=\"_blank\">Berkeley Ecoinformatics Engine (HOLOS)</a>. Built with open source software and using a RESTful API structure, this engine encourages further data synthesis by making available a wide variety of data sources, both historical and contemporary. The Berkeley Ecoinformatics Engine serves much of the ecological data collected at UC Berkeley, among them about 5,000,000 million records from museum specimen, soil and pollen data, field station records, sensor readings, as well as biophysical base layers such as climate and land use.</p>\n" +
    "		<p>We recommend downloading the data in full to work with, but researchers can also interact with the data through the HOLOS <a href=\"https://ecoengine.berkeley.edu\" target=\"_blank\">API</a>. If the data is used in research, we ask that you use this citation: Kelly, M., B. Allen-Diaz, and N. Kobzina. 2005. <em>Digitization of a historic dataset: the Wieslander California vegetation type mapping project.</em> Madro&ntilde;o 52(3):191-201.</p> \n" +
    "\n" +
    "		<p>\n" +
    "			These are the entry endpoints for VTM data on the HOLOS API. For more details on using the API, read the HOLOS <a href=\"https://ecoengine.berkeley.edu/docs/wieslander.html\" target=\"_blank\">documentation</a>.\n" +
    "			<pre>https://ecoengine.berkeley.edu/api/vtmplots_trees/</pre>\n" +
    "			<pre>https://ecoengine.berkeley.edu/api/vtmplots/</pre>\n" +
    "			<pre>https://ecoengine.berkeley.edu/api/vtmplots_brushes/</pre>\n" +
    "			<pre>https://ecoengine.berkeley.edu/api/vtmveg/</pre>\n" +
    "			<pre>https://ecoengine.berkeley.edu/api/photos/?collection_code=VTM</pre>\n" +
    "		</p>\n" +
    "    </div>    \n" +
    "</div>\n" +
    "");
}]);

angular.module("howto/howto.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("howto/howto.tpl.html",
    "<div class=\"container\" id=\"data-use\" ng-controller=\"HowtoCtrl\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-md-12\">\n" +
    "			<h3>\n" +
    "				<span class=\"title\">{{pageTitle | split:'|':0}}</span>\n" +
    "			</h3>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <hr/>\n" +
    "    <div ui-view></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module('templates-common', []);


})( window, window.angular );
