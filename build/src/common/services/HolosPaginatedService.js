angular.module( 'services.HolosPaginatedResource', ['restangular'])


.factory('HolosPaginated', ['$q', 'Restangular',
  function($q, Restangular) {
    
    // private data vars
    var ServiceProvider = function(){};

    ServiceProvider.prototype.loadList = function(resource, queryParams){
      var deferred = $q.defer();
      var collection = [];
      var nextUrl;

      var loadNextPage = function (nextUrl) {
        Restangular.allUrl(resource, nextUrl).getList()
           .then(function(d) {
                collection = collection.concat(d['results']);
                if (d['next']) {
                   nextUrl = d['next'];
                   //Strip nextUrl of query param format=json because of Restangular
                  //is configured to add it by default (configured in app.js)
                   //nextUrl = nextUrl.replace(/&format=json/g, '');
                   loadNextPage(nextUrl);
                }
                else {
                  deferred.resolve(collection);
                }
           });
      };

      //First call to resource, loads first page into collection
      //Call loadNextPage function recursively if there is more than one page
      //TODO: Refactor
      Restangular.all(resource).getList(queryParams)
        .then( function (d) {

          collection = collection.concat(d['results']);

          if (d['next']) {
            nextUrl = d['next'];
            //Strip nextUrl of query param &format=json because Restangular
            //is configured to add it by default to every request
            //(configured in app.js)
            //nextUrl = nextUrl.replace(/&format=json/g, '');
            loadNextPage(nextUrl);
          }
          else {
            deferred.resolve(collection);
          }

        });

      return deferred.promise;
    };

    var service = {
      getInstance:function(){ return new ServiceProvider(); }
    };

    return service;


}])


;
