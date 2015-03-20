angular.module('directives.resizableImage', []).directive('resizableImage', [
  '$window',
  function ($window) {
    function ScaleImage(srcwidth, srcheight, targetwidth, targetheight, fLetterBox) {
      var result = {
          width: 0,
          height: 0,
          fScaleToTargetWidth: true
        };
      if (srcwidth <= 0 || srcheight <= 0 || targetwidth <= 0 || targetheight <= 0) {
        return result;
      }
      var scaleX1 = targetwidth;
      var scaleY1 = srcheight * targetwidth / srcwidth;
      var scaleX2 = srcwidth * targetheight / srcheight;
      var scaleY2 = targetheight;
      var fScaleOnWidth = scaleX2 > targetwidth;
      if (fScaleOnWidth) {
        fScaleOnWidth = fLetterBox;
      } else {
        fScaleOnWidth = !fLetterBox;
      }
      if (fScaleOnWidth) {
        result.width = Math.floor(scaleX1);
        result.height = Math.floor(scaleY1);
        result.fScaleToTargetWidth = true;
      } else {
        result.width = Math.floor(scaleX2);
        result.height = Math.floor(scaleY2);
        result.fScaleToTargetWidth = false;
      }
      result.targetleft = Math.floor((targetwidth - result.width) / 2);
      result.targettop = Math.floor((targetheight - result.height) / 2);
      return result;
    }
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var windowHeight, windowWidth;
        scope.resizeImage = function () {
          var img = element;
          var w = $(img).width();
          var h = $(img).height();
          var tw = $(img).offsetParent().width();
          var th = $(img).offsetParent().height();
          if (w > h) {
            tw = tw + tw * 0.25;
            th = th + th * 0.25;
          }
          var result = new ScaleImage(w, h, tw, th, false);
          img[0].width = result.width;
          img[0].height = result.height;
          var newImgX = Math.round((tw - img[0].width) / 2);
          var newImgY = Math.round((th - img[0].height) / 3);
          $(img).css('top', newImgY);
          $(img).css('left', newImgX);
        };
        scope.initializeWindowSize = function () {
          windowHeight = $window.innerHeight;
          windowWidth = $window.innerWidth;
        };
        angular.element($window).bind('resize', function () {
          scope.resizeImage();
          scope.$apply();
        });
        element.bind('load', function () {
          scope.resizeImage();
        });
      }
    };
  }
]);
;