angular.module( 'vtm.about', [
  'ui.router',
  'filters.split',
  'ui.bootstrap'
])

.config(function config( $stateProvider ) {
  $stateProvider
  .state( 'about', {
    abstract: true,
    url: '/about',
    controller: 'AboutCtrl',
    templateUrl: 'about/about.tpl.html'
  })
  .state( 'about.overview', {
    url: '/',
    templateUrl: 'about/about.overview.tpl.html',
    data:{ pageTitle: 'History' }
  })
  .state( 'about.description', {
    url: '/description',
    templateUrl: 'about/about.description.tpl.html',
    data:{ pageTitle: 'Data Description' }
  })
  .state( 'about.metadata', {
    url: '/metadata',
    templateUrl: 'about/about.metadata.tpl.html',
    data:{ pageTitle: 'Metadata' }
  })
  .state( 'about.plotdata', {
	url: '/plotdata',
	templateUrl: 'about/about.plotdata.tpl.html',
	data:{ pageTitle: 'Plot Data' }
  })
  .state( 'about.plotmaps', {
	url: '/plotmaps',
	templateUrl: 'about/about.plotmaps.tpl.html',
	data:{ pageTitle: 'Plot Maps' }
  })
  .state( 'about.faq', {
	url: '/faq',
	templateUrl: 'about/about.faq.tpl.html',
	data:{ pageTitle: 'Frequently Asked Questions' }
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

  $scope.status = {
    open: false
  };

})

;
