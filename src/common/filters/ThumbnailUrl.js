

angular.module( 'filters.thumbnail', [])

.filter('thumbnailUrl', [function() {

  
      //public functions          
     return function(url) {
		var thumbnailUrl = url.replace(/imgs\/(.*?)(\/)/, "imgs/128x192/");
		return thumbnailUrl;

     };

}])

;