angular.module( 'vtm.about', [
  'ui.router',
  'customFilters'
])

.config(function config( $stateProvider ) {
  $stateProvider
  .state( 'about', {
    abstract: true,
    url: '/about',
    controller: 'AboutCtrl',
    templateUrl: 'about/about.tpl.html',
    data:{ pageTitle: 'History' }
  })
    .state( 'about.overview', {
      url: '/',
      templateUrl: 'about/about.overview.tpl.html'

    })
    .state( 'about.publications', {
      url: '/publications',
      templateUrl: 'about/about.publications.tpl.html',
      data:{ pageTitle: 'Publications' }
    })
    .state( 'about.citations', {
      url: '/citations',
      templateUrl: 'about/about.citations.tpl.html',
      data:{ pageTitle: 'Suggested Citations' }
    });
})

.controller( 'AboutCtrl', function AboutCtrl( $scope ) {

})

;
