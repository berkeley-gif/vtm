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