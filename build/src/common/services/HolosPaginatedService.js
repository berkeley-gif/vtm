angular.module('services.HolosPaginatedResource', ['restangular']).factory('HolosPaginated', [
  '$q',
  'Restangular',
  function ($q, Restangular) {
    var ServiceProvider = function () {
    };
    ServiceProvider.prototype.loadList = function (resource, queryParams) {
      var deferred = $q.defer();
      var collection = [];
      var nextUrl;
      var loadNextPage = function (nextUrl) {
        Restangular.allUrl(resource, nextUrl).getList().then(function (d) {
          collection = collection.concat(d.results);
          if (d.next) {
            nextUrl = d.next;
            loadNextPage(nextUrl);
          } else {
            deferred.resolve(collection);
          }
        });
      };
      Restangular.all(resource).getList(queryParams).then(function (d) {
        collection = collection.concat(d.results);
        if (d.next) {
          nextUrl = d.next;
          loadNextPage(nextUrl);
        } else {
          deferred.resolve(collection);
        }
      });
      return deferred.promise;
    };
    var service = {
        getInstance: function () {
          return new ServiceProvider();
        }
      };
    return service;
  }
]);
;