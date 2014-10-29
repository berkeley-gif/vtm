angular.module( 'services.VtmPlotsService', ['services.HolosPaginatedResource'])

.factory('VtmPlots', ['HolosPaginated', 'leafletLayerHelpers',
  function( HolosPaginated, leafletLayerHelpers) {

     // private data vars
     var markerArray = [];
     var markerCount;

     var icons = {
        plotIcon: {
          type: 'div',
          iconSize: [10, 10],
          iconAnchor: [0, 0],
          className: 'plot-marker-icon'
        }
      }; 

      var queryParams = {
        'format': 'json',
        'fields': 'plot_no,url,geojson'
      };

      //private functions 
      var newMarker = function (jsonObject, index){
        var marker = {};
        if (jsonObject.hasOwnProperty('geojson')){
            marker.lat = jsonObject.geojson.coordinates[1];
            marker.lng = jsonObject.geojson.coordinates[0];
        } else {
          return;
        }
        marker.plot_no = jsonObject['plot_no'];
        marker.url = jsonObject['url'];
        marker.layer = 'plots';
        marker.icon = icons.plotIcon;
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
            console.log(markerCount + ' new plot markers created');

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

            //Send request to Holos
            var holosInstance = HolosPaginated.getInstance();
            holosInstance.loadList('vtmplots', queryParams).then(function(data){              
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