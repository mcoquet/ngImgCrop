'use strict';

crop.directive('imgCrop', ['$timeout', 'cropHost', 'cropPubSub', function($timeout, CropHost, CropPubSub) {
  return {
    restrict: 'E',
    scope: {
      image: '=',
      resultImage: '=',
      cropCoords: '=?',

      changeOnFly: '=?',
      areaType: '@',
      areaMinSize: '=?',
      resultImageSize: '=?',
      resultImageFormat: '@',
      resultImageQuality: '=?',
      aspectRatio: '=?',

      onChange: '&',
      onLoadBegin: '&',
      onLoadDone: '&',
      onLoadError: '&'
    },
    template: '<canvas></canvas>',
    controller: ['$scope', function($scope) {
      $scope.events = new CropPubSub();
    }],
    link: function(scope, element/*, attrs*/) {
      // Init Events Manager
      var events = scope.events;

      // Init Crop Host
      var cropHost=new CropHost(element.find('canvas'), {}, events);

      // Store Result Image to check if it's changed
      var storedResultImage;

      var updateResultImage=function(scope) {
        var resultImage=cropHost.getResultImageDataURI();
        if(storedResultImage!==resultImage) {
          scope.resultImage = storedResultImage = resultImage;
          scope.onChange({$dataURI: scope.resultImage});
        }
      };

      var updateAreaCoords = function (scope) {
        var areaCoords = cropHost.getAreaCoords();
        scope.areaCoords = areaCoords;
      };

      var updateCropCoords = function (scope) {
        var areaCoords = cropHost.getAreaCoords();

        var dimRatio = {
          x: cropHost.getArea().getImage().width / cropHost.getArea().getCanvasSize().w,
          y: cropHost.getArea().getImage().height / cropHost.getArea().getCanvasSize().h
        };

        scope.cropCoords = {
          areaCoords: areaCoords,
          cropWidth: areaCoords.w,
          cropHeight: areaCoords.h,
          cropTop: areaCoords.y,
          cropLeft: areaCoords.x,
          cropImageWidth: Math.round(areaCoords.w * dimRatio.x),
          cropImageHeight: Math.round(areaCoords.h * dimRatio.y),
          cropImageTop: Math.round(areaCoords.y * dimRatio.y),
          cropImageLeft: Math.round(areaCoords.x * dimRatio.x)
        };
      };

      // Wrapper to safely exec functions within $apply on a running $digest cycle
      var fnSafeApply=function(fn) {
        return function(){
          $timeout(function(){
            scope.$apply(function(scope){
              fn(scope);
            });
          });
        };
      };

      // Setup CropHost Event Handlers
      events
        .on('load-start', fnSafeApply(function(scope){
          scope.onLoadBegin({});
        }))
        .on('load-done', fnSafeApply(function(scope){
          scope.onLoadDone({});
        }))
        .on('load-error', fnSafeApply(function(scope){
          scope.onLoadError({});
        }))
        .on('area-move area-resize', fnSafeApply(function(scope){
          if(!!scope.changeOnFly) {
            updateResultImage(scope);
          }
          updateCropCoords(scope);
        }))
        .on('area-move-end area-resize-end image-updated', fnSafeApply(function(scope){
          updateResultImage(scope);
          updateCropCoords(scope);
        }));

      // Sync CropHost with Directive's options
      scope.$watch('image',function(){
        cropHost.setNewImageSource(scope.image);
      });
      scope.$watch('areaType',function(){
        cropHost.setAreaType(scope.areaType);
        updateResultImage(scope);
      });
      scope.$watch('areaMinSize',function(){
        cropHost.setAreaMinSize(scope.areaMinSize);
        updateResultImage(scope);
      });
      scope.$watch('resultImageSize',function(){
        cropHost.setResultImageSize(scope.resultImageSize);
        updateResultImage(scope);
      });
      scope.$watch('resultImageFormat',function(){
        cropHost.setResultImageFormat(scope.resultImageFormat);
        updateResultImage(scope);
      });
      scope.$watch('resultImageQuality',function(){
        cropHost.setResultImageQuality(scope.resultImageQuality);
        updateResultImage(scope);
      });
      scope.$watch('aspectRatio', function(){
        if (typeof scope.aspectRatio == 'string' && scope.aspectRatio != '') {
          scope.aspectRatio = parseInt(scope.aspectRatio);
        }
        if (scope.aspectRatio) cropHost.setAspect(scope.aspectRatio);
      });

      // Update CropHost dimensions when the directive element is resized
      scope.$watch(
        function () {
          return [element[0].clientWidth, element[0].clientHeight];
        },
        function (value) {
          cropHost.setMaxDimensions(value[0],value[1]);
          updateResultImage(scope);
        },
        true
      );

      // Destroy CropHost Instance when the directive is destroying
      scope.$on('$destroy', function(){
          cropHost.destroy();
      });
    }
  };
}]);
