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
  baseUrl: 'https://ecoengine.berkeley.edu'
  //apiKey: ''
})

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, RestangularProvider, HOLOS_CONFIG) {

  $urlRouterProvider.otherwise( '/home' );

  ///////////////////////////////
  // Restangular Configuration //
  ///////////////////////////////

  RestangularProvider.setBaseUrl( HOLOS_CONFIG.baseUrl + '/api' );
  RestangularProvider.setDefaultRequestParams({
      //apiKey: HOLOS_CONFIG.apiKey,
      format: 'json'
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

