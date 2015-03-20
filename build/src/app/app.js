angular.module('vtm', [
  'templates-app',
  'templates-common',
  'vtm.home',
  'vtm.about',
  'vtm.data',
  'vtm.howto',
  'ui.router',
  'ngAnimate',
  'djds4rce.angular-socialshare',
  'holos.config'
]).config([
  '$stateProvider',
  '$urlRouterProvider',
  'RestangularProvider',
  'ENV',
  function myAppConfig($stateProvider, $urlRouterProvider, RestangularProvider, ENV) {
    $urlRouterProvider.otherwise('/home');
    RestangularProvider.setBaseUrl(ENV.apiEndpoint + '/api');
    RestangularProvider.setDefaultRequestParams({});
    RestangularProvider.setRequestSuffix('/');
    RestangularProvider.addResponseInterceptor(function (element, operation, what, url, response, deferred) {
      var extractedData = [];
      if (operation === 'getList') {
        extractedData.results = element.features ? element.features : element.results;
        extractedData.count = element.count;
        extractedData.next = element.next;
        extractedData.prev = element.prev;
      } else {
        extractedData = element;
      }
      return extractedData;
    });
    RestangularProvider.setErrorInterceptor(function (response, deferred, responseHandler) {
      if (response.status == 400) {
        console.log('The request had bad syntax or was inherently impossible to be satisfied.');
      } else if (response.status == 404) {
        console.log('Resource not available...');
      } else {
        console.log('Response received with HTTP error code: ' + response.status);
      }
      return false;
    });
  }
]).run([
  '$rootScope',
  '$location',
  '$window',
  function ($rootScope, $location, $window) {
    $rootScope.$on('$stateChangeSuccess', function (event) {
      if (!$window.ga) {
        return;
      }
      $window.ga('send', 'pageview', { page: $location.path() });
    });
  }
]).controller('AppCtrl', [
  '$scope',
  '$location',
  function AppCtrl($scope, $location) {
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      if (angular.isDefined(toState.data.pageTitle)) {
        $scope.pageTitle = toState.data.pageTitle + ' | VTM';
      }
    });
    $scope.socialShare = ' #vtm The most ambitious attempt ever made to describe the complex vegetation of CA';
  }
]);