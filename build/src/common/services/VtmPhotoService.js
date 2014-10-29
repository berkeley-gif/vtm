angular.module( 'services.VtmPhotoService', ['services.HolosPaginatedResource'])

.factory('VtmPhotos', ['HolosPaginated', 'leafletLayerHelpers',
  function( HolosPaginated, leafletLayerHelpers) {

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
        'georeferenced' : true
      };

     //private functions 
     var newMarker = function (jsonObject, index){
        var marker = {};
        for (var k in jsonObject) {
          if (jsonObject.hasOwnProperty(k)){
            if (k === 'geojson') {
              marker.lat = jsonObject.geojson.coordinates[1];
              marker.lng = jsonObject.geojson.coordinates[0];
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
              //Check for valid geojson property
              if (jsonObject.geojson.coordinates){
                var marker = newMarker(jsonObject, idx);
                markerArray.push(marker);
                idx++;
              }
            });
            markerCount = markerArray.length;
            console.log(markerCount + ' new markers created');

      };

      //public functions          
     return {
          loadMarkers: function(extraParams) {  

            //Add extra params to queryParams
            for (var p in extraParams){
              if (extraParams.hasOwnProperty(p)){
                queryParams[p] = extraParams[p];
              } 
            }
            console.log(queryParams);

            //Send request to Holos
            HolosPaginated.loadList('photos', queryParams).then(function(data){
              console.log('from holos', data);
              if (data.length > 0) {
                createMarkers(data);
              }              
            });

          },
          getMarkers: function(){
            return markerArray;
          }
     };


}])

;