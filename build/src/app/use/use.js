angular.module( 'vtm.use', [
  'ui.router',
  'ui.bootstrap'
])

.config(function config( $stateProvider ) {
  $stateProvider
  .state( 'use', {
    abstract: true,
    url: '/use',
    controller: 'UseCtrl',
    templateUrl: 'use/use.tpl.html'
  })
  .state( 'use.overview', {
    url: '/',
    templateUrl: 'use/use.overview.tpl.html',
    data:{ pageTitle: 'Data Use' }
  });
})

.controller( 'UseCtrl', function UseCtrl( $scope ) {

})

;
