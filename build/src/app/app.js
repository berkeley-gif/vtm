angular.module( 'vtm', [
  'templates-app',
  'templates-common',
  'vtm.home',
  'vtm.about',
  'vtm.data',
  'vtm.howto',
  'ui.router',
  'ngAnimate',
  'djds4rce.angular-socialshare'
])

.constant('HOLOS_CONFIG', {
  baseUrl: 'https://dev-ecoengine.berkeley.edu'
  //apiKey: ''
})

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, RestangularProvider, HOLOS_CONFIG) {

  $urlRouterProvider.otherwise( '/home' );

  ///////////////////////////////
  // Restangular Configuration //
  ///////////////////////////////

  RestangularProvider.setBaseUrl( HOLOS_CONFIG.baseUrl + '/api' );

  //Set default request params for all supported request methods
  RestangularProvider.setDefaultRequestParams(
    { 
      //apiKey: HOLOS_CONFIG.apiKey,
      //format: 'json'
    }
  );
  RestangularProvider.setRequestSuffix('/');

  //Set default request params only for get method
  //RestangularProvider.setDefaultRequestParams('get', {format: 'json'});

  //Add a Response Interceptor to convert object returned by Holos API to array for 
  //Restangular getList() operations
  RestangularProvider.addResponseInterceptor(function(element, operation, what, url, response, deferred) {
    var extractedData = [];
    // .. to look for getList operations
    if (operation === "getList") {
      // .. and handle the data and meta data
      extractedData.results = element.features? element.features : element.results;
      extractedData.count = element.count;
      extractedData.next = element.next;
      extractedData.prev = element.prev;
    } else {
      extractedData = element;
    }
    return extractedData;
  });

  //Add a Response Interceptor to convert object returned by Holos API to array for 
  //Restangular getList() operations
  RestangularProvider.setErrorInterceptor(function(response, deferred, responseHandler) {
    
    if (response.status == 400) {
      console.log("The request had bad syntax or was inherently impossible to be satisfied.");
    } else if (response.status == 404) {
      console.log("Resource not available...");
    } else {
      console.log("Response received with HTTP error code: " + response.status );
    }
    return false; // stop the promise chain

  });

})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | VTM' ;
    }
  });

  $scope.socialShare = " #vtm The most ambitious attempt ever made to describe the complex vegetation of CA";
});

