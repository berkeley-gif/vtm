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