angular.module( 'services.HolosPaginatedResource', ['restangular'])


.factory('HolosPaginated', ['$q', '$timeout', 'Restangular',
  function($q, $timeout, Restangular) {
     
     // private data vars
     var _collection = [];
      
    //public functions          
     return {
          loadList: function(resource, queryParams) {

            var deferred = $q.defer();
            _collection.length = 0; //empty array of any previous results
            var nextUrl;

            var loadNextPage = function (nextUrl) {
              Restangular.allUrl('photos', nextUrl).getList()
                 .then(function(d) {
                      _collection = _collection.concat(d['results']);
                      if (d['next']) {
                         nextUrl = d['next'];
                         //Strip nextUrl of query param format=json because of Restangular
                        //is configured to add it by default (configured in app.js)
                         nextUrl = nextUrl.replace(/&format=json/g, '');
                         loadNextPage(nextUrl);
                      }
                      else {
                        deferred.resolve(_collection);
                      }
                 });
            };

            //First call to resource, loads first page into _collection
            //Call loadNextPage function recursively if there is more than one page
            //TODO: Refactor
            Restangular.all(resource).getList(queryParams)
              .then( function (d) {

                _collection = _collection.concat(d['results']);

                if (d['next']) {
                  nextUrl = d['next'];
                  //Strip nextUrl of query param &format=json because Restangular
                  //is configured to add it by default to every request
                  //(configured in app.js)
                  nextUrl = nextUrl.replace(/&format=json/g, '');
                  loadNextPage(nextUrl);
                }
                else {
                  deferred.resolve(_collection);
                }

              });

            return deferred.promise;
          },
          getList: function() {
               return _collection;
          }
     };


}])


;
