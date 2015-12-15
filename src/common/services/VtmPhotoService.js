angular.module( 'services.VtmPhotoService', ['services.HolosPaginatedResource'])

.factory('VtmPhotos', ['$q', 'HolosPaginated',
  function( $q, HolosPaginated) {

     // private data vars
     
     var markerArray = [];
     var markerCount;

     var icons = {
        photoIcon: {
          type: 'div',
          iconSize: [20, 20],
          iconAnchor: [0, 0],
          className: 'photo-marker-icon'
        }
      };    

      var queryParams = {
        'collection_code' : 'VTM',
        'georeferenced' : true,
        'format': 'json'
      };

     //private functions 
     var newMarker = function (jsonObject, index){
        var marker = {};
        for (var k in jsonObject) {
          if (jsonObject.hasOwnProperty(k)){
            if (k === 'geometry') {
              marker.lat = jsonObject.geometry.coordinates[1];
              marker.lng = jsonObject.geometry.coordinates[0];
            } else {
              marker[k] = jsonObject[k];
            }
          } 
        }
        marker.layer = 'photos';
        marker.icon = icons.photoIcon;
        marker.clickable = true;
        return marker;      
     };

     var createMarkers = function(data) {
            //empty array of any previous markers
            markerArray.length = 0;
            var idx = 0;
            data.forEach(function(jsonObject){
              //Check for valid geometry property
              if (jsonObject && jsonObject.geometry.coordinates){
                var marker = newMarker(jsonObject, idx);
                markerArray.push(marker);
                idx++;
              }
            });
            markerCount = markerArray.length;
            console.log(markerCount + ' new photo markers created');

      };

      //public functions          
     return {
          loadMarkers: function(extraParams) {  

            var deferred = $q.defer();

            //Add extra params to queryParams
            for (var p in extraParams){
              if (extraParams.hasOwnProperty(p)){
                queryParams[p] = extraParams[p];
              } 
            }

            //Send request to Holos
            var holosInstance = HolosPaginated.getInstance();
            holosInstance.loadList('photos', queryParams).then(function(data){
              if (data.length > 0) {
                createMarkers(data);
                deferred.resolve(markerArray);
              }              
            });

            return deferred.promise;

          }
     };


}])

;