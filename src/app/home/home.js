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
angular.module( 'vtm.home', [
  'ui.router',
  'ui.bootstrap',
  'directives.animatedBanner'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
  $stateProvider.state( 'home', {
    url: '/home',
    controller: 'HomeCtrl',
    templateUrl: 'home/home.tpl.html',
    data:{ pageTitle: 'Home' }
  });
})

/**
 * Controller for our route.
 */
.controller( 'HomeCtrl', function HomeController( $scope, $timeout ) {

  //Collection of banner images
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


  // Default to a random image.
  var imageCount = $scope.images.length;
  var index = Math.floor((Math.random() * imageCount * 2 ) % imageCount);
  $scope.image = $scope.images[ index ];

  var slideImage = (function() {
    var loop = $timeout(function changePic() {
        index = (index + 1) % imageCount;
        $scope.image = $scope.images[ index ];
        loop = $timeout(changePic, 10000);
    },5000);
  }());

  

})

;

