angular.module( 'vtm', [
  'templates-app',
  'templates-common',
  'vtm.home',
  'vtm.about',
  'vtm.data',
  'vtm.howto',
  'ui.router',
  'ngAnimate',
  'restangular'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, RestangularProvider ) {

  $urlRouterProvider.otherwise( '/home' );

  ///////////////////////////////
  // Restangular Configuration //
  ///////////////////////////////

  RestangularProvider.setBaseUrl('https://dev-ecoengine.berkeley.edu/api');
  RestangularProvider.setDefaultRequestParams({
      //apiKey: HOLOS_CONFIG.apiKey,
      format: 'json'
  });

})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | VTM' ;
    }
  });
});

