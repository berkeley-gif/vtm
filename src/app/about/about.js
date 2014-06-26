angular.module( 'vtm.about', [
  'ui.router',
  'placeholders'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'about', {
    url: '/about',
    views: {
      "main": {
        controller: 'AboutCtrl',
        templateUrl: 'about/about.tpl.html'
      }
    },
    data:{ pageTitle: 'Learn More' }
  });
})

.controller( 'AboutCtrl', function AboutCtrl( $scope ) {

})

;
