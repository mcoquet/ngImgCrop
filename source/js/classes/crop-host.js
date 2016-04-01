'use strict';

crop.factory('cropHost', ['$document', 'cropAreaCircle', 'cropAreaSquare', 'cropAreaRectangle', 'cropEXIF', function($document, CropAreaCircle, CropAreaSquare, CropAreaRectangle, cropEXIF) {
  /* STATIC FUNCTIONS */

  // Get Element's Offset
  var getElementOffset=function(elem) {
      var box = elem.getBoundingClientRect();

      var body = document.body;
      var docElem = document.documentElement;

      var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
      var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

      var clientTop = docElem.clientTop || body.clientTop || 0;
      var clientLeft = docElem.clientLeft || body.clientLeft || 0;

      var top  = box.top +  scrollTop - clientTop;
      var left = box.left + scrollLeft - clientLeft;

      return { top: Math.round(top), left: Math.round(left) };
  };

  return function(elCanvas, opts, events){
    /* PRIVATE VARIABLES */

    // Object Pointers
    var ctx=null,
        image=null,
        theArea=null,
        initMax = true,
        isAspectRatio = null,
        self = this;

    // Dimensions
    var minCanvasDims=[100,100],
        maxCanvasDims=[300,300];

    // Result Image size
    var resImgSizeArray = [],
        resImgSize = {
          w: 200,
          h: 200
        },
        areaMinRelativeSize = null;

    // Result Image type
    var resImgFormat='image/png';

    // Result Image quality
    var resImgQuality=null;

    var forceAspectRatio = false;

    /* PRIVATE FUNCTIONS */
    this.setInitMax = function(bool){
      initMax=bool;
    };

    // Draw Scene
    function drawScene() {
      // clear canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if(image!==null) {
        // draw source image
        ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.save();

        // and make it darker
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.restore();

        // draw Area
        theArea.draw();
      }
    }

    // Resets CropHost
    var resetCropHost = function() {
      if (image !== null) {
        theArea.setImage(image);

        var areaType = self.getAreaType(); // use `aspectRatio` instead of `resImgSize` dimensions bc `resImgSize` can be 'selection' string
        var aspectRatio = theArea.getAspect();

        var imageDims = [image.width, image.height],
          imageRatio = image.width / image.height,
          canvasDims = imageDims;

        // hack to fix re-crop of the image that is already cropped (happenning with the rectangle area type)
        var incorrectImageDims = !image.src.match(/^http/) && areaType == 'rectangle' && imageRatio == 1 && image.width == 200;
        if (incorrectImageDims) {
          imageRatio = aspectRatio;
        }

        if (canvasDims[0] > maxCanvasDims[0]) {
          canvasDims[0] = maxCanvasDims[0];
          canvasDims[1] = canvasDims[0] / imageRatio;
        } else if (canvasDims[0] < minCanvasDims[0]) {
          canvasDims[0] = minCanvasDims[0];
          canvasDims[1] = canvasDims[0] / imageRatio;
        }
        if (canvasDims[1] > maxCanvasDims[1]) {
          canvasDims[1] = maxCanvasDims[1];
          canvasDims[0] = canvasDims[1] * imageRatio;
        } else if (canvasDims[1] < minCanvasDims[1]) {
          canvasDims[1] = minCanvasDims[1];
          canvasDims[0] = canvasDims[1] * imageRatio;
        }
        elCanvas.prop('width', canvasDims[0]).prop('height', canvasDims[1]).css({
          'margin-left': -canvasDims[0] / 2 + 'px',
          'margin-top': -canvasDims[1] / 2 + 'px'
        });

        var cw = ctx.canvas.width;
        var ch = ctx.canvas.height;

        // enforce 1:1 aspect ratio for square-like selections
        if ((areaType === 'circle') || (areaType === 'square')) {
          if(ch < cw) cw = ch;
          else ch = cw;
        } else if (areaType === 'rectangle' && isAspectRatio && !incorrectImageDims){
          cw = aspectRatio * ch;
        }

        // the second part of the hack
        if (incorrectImageDims) {
          image.width = cw;
          image.height = ch;
        }

        if(initMax){
          theArea.setSize({
            w: cw,
            h: ch
          });
        }else if(undefined !== theArea.getInitSize() ) {
          theArea.setSize({
            w: Math.min(theArea.getInitSize().w, cw / 2),
            h: Math.min(theArea.getInitSize().h, ch / 2)
          });
        } else {
          theArea.setSize({
            w: Math.min(200, cw / 2),
            h: Math.min(200, ch / 2)
          });
        }

        theArea.setCenterPoint({
          x: ctx.canvas.width / 2,
          y: ctx.canvas.height / 2
        });

      } else {
        elCanvas.prop('width', 0).prop('height', 0).css({
          'margin-top': 0
        });
      }

      drawScene();
    };

    /**
     * Returns event.changedTouches directly if event is a TouchEvent.
     * If event is a jQuery event, return changedTouches of event.originalEvent
     */
    var getChangedTouches=function(event){
      if(angular.isDefined(event.changedTouches)){
        return event.changedTouches;
      }else{
        return event.originalEvent.changedTouches;
      }
    };

    var onMouseMove=function(e) {
      if(image!==null) {
        var offset=getElementOffset(ctx.canvas),
            pageX, pageY;
        if(e.type === 'touchmove') {
          pageX=getChangedTouches(e)[0].pageX;
          pageY=getChangedTouches(e)[0].pageY;
        } else {
          pageX=e.pageX;
          pageY=e.pageY;
        }
        theArea.processMouseMove(pageX-offset.left, pageY-offset.top);
        drawScene();
      }
    };

    var onMouseDown=function(e) {
      e.preventDefault();
      e.stopPropagation();
      if(image!==null) {
        var offset=getElementOffset(ctx.canvas),
            pageX, pageY;
        if(e.type === 'touchstart') {
          pageX=getChangedTouches(e)[0].pageX;
          pageY=getChangedTouches(e)[0].pageY;
        } else {
          pageX=e.pageX;
          pageY=e.pageY;
        }
        theArea.processMouseDown(pageX-offset.left, pageY-offset.top);
        drawScene();
      }
    };

    var onMouseUp=function(e) {
      if(image!==null) {
        var offset=getElementOffset(ctx.canvas),
            pageX, pageY;
        if(e.type === 'touchend') {
          pageX=getChangedTouches(e)[0].pageX;
          pageY=getChangedTouches(e)[0].pageY;
        } else {
          pageX=e.pageX;
          pageY=e.pageY;
        }
        theArea.processMouseUp(pageX-offset.left, pageY-offset.top);
        drawScene();
      }
    };

    /*
      For future reference: this is where the ACTUAL crop happens.
    */

    this.getResultImageDataURI=function() {
      var temp_ctx, temp_canvas,
        ris = self.getResultImageSize(),
        center = theArea.getCenterPoint();
      temp_canvas = angular.element('<canvas></canvas>')[0];
      temp_ctx = temp_canvas.getContext('2d');
      temp_canvas.width = ris.w;
      temp_canvas.height = ris.h;

      var x, y, areaWidth, areaHeight = 0;

      if(image!==null) {

        x = (center.x - theArea.getSize().w / 2) * (image.width / ctx.canvas.width);
        y = (center.y - theArea.getSize().h / 2) * (image.height / ctx.canvas.height);
        areaWidth = theArea.getSize().w * (image.width / ctx.canvas.width);
        areaHeight = theArea.getSize().h * (image.height / ctx.canvas.height);

        if ( forceAspectRatio ) {
          temp_ctx.drawImage( image, x, y,
            areaWidth,
            areaHeight,
            0,
            0,
            ris.w,
            ris.h );
        } else {
          var aspectRatio = areaWidth / areaHeight;
          var resultHeight, resultWidth;

          if ( aspectRatio > 1 ) {
            resultWidth = ris.w;
            resultHeight = resultWidth / aspectRatio;
          } else {
            resultHeight = ris.h;
            resultWidth = resultHeight * aspectRatio;
          }

          temp_ctx.drawImage( image,
            x,
            y,
            areaWidth,
            areaHeight,
            0,
            0,
            Math.round( resultWidth ),
            Math.round( resultHeight ) );
        }
        if ( resImgQuality !== null ) {
          return temp_canvas.toDataURL( resImgFormat, resImgQuality );
        }
        return temp_canvas.toDataURL( resImgFormat );
      }
    };

    this.getAreaCoords = function() {
      return theArea.getSize()
    };

    this.getArea = function() {
      return theArea;
    };

    this.setNewImageSource=function(imageSource) {
      image=null;
      resetCropHost();
      events.trigger('image-updated');
      if(!!imageSource) {
        var newImage = new Image();
        newImage.onload = function(){
          events.trigger('load-done');

          cropEXIF.getData(newImage,function(){
            var orientation=cropEXIF.getTag(newImage,'Orientation');

            if([3,6,8].indexOf(orientation)>-1) {
              var canvas = document.createElement("canvas"),
                  ctx=canvas.getContext("2d"),
                  cw = newImage.width, ch = newImage.height, cx = 0, cy = 0, deg=0;
              switch(orientation) {
                case 3:
                  cx=-newImage.width;
                  cy=-newImage.height;
                  deg=180;
                  break;
                case 6:
                  cw = newImage.height;
                  ch = newImage.width;
                  cy=-newImage.height;
                  deg=90;
                  break;
                case 8:
                  cw = newImage.height;
                  ch = newImage.width;
                  cx=-newImage.width;
                  deg=270;
                  break;
              }

              canvas.width = cw;
              canvas.height = ch;
              ctx.rotate(deg*Math.PI/180);
              ctx.drawImage(newImage, cx, cy);

              image=new Image();
              image.src = canvas.toDataURL("image/png");
            } else {
              image=newImage;
            }
            resetCropHost();
            events.trigger('image-updated');
          });
        };
        newImage.onerror=function() {
          events.trigger('load-error');
        };
        events.trigger('load-start');
        newImage.src=imageSource;
      }
    };

    this.setMaxDimensions=function(width, height) {
      maxCanvasDims=[width,height];

      if(image!==null) {
        var curWidth=ctx.canvas.width,
            curHeight=ctx.canvas.height;

        var imageDims=[image.width, image.height],
            imageRatio=image.width/image.height,
            canvasDims=imageDims;

        if(canvasDims[0]>maxCanvasDims[0]) {
          canvasDims[0]=maxCanvasDims[0];
          canvasDims[1]=canvasDims[0]/imageRatio;
        } else if(canvasDims[0]<minCanvasDims[0]) {
          canvasDims[0]=minCanvasDims[0];
          canvasDims[1]=canvasDims[0]/imageRatio;
        }
        if(canvasDims[1]>maxCanvasDims[1]) {
          canvasDims[1]=maxCanvasDims[1];
          canvasDims[0]=canvasDims[1]*imageRatio;
        } else if(canvasDims[1]<minCanvasDims[1]) {
          canvasDims[1]=minCanvasDims[1];
          canvasDims[0]=canvasDims[1]*imageRatio;
        }
        elCanvas.prop('width',canvasDims[0]).prop('height',canvasDims[1]).css({'margin-left': -canvasDims[0]/2+'px', 'margin-top': -canvasDims[1]/2+'px'});

        var ratioNewCurWidth=ctx.canvas.width/curWidth,
            ratioNewCurHeight=ctx.canvas.height/curHeight,
            ratioMin=Math.min(ratioNewCurWidth, ratioNewCurHeight);

        theArea.setSize({
          w: theArea.getSize().w * ratioMin,
          h: theArea.getSize().h * ratioMin
        });
        var center = theArea.getCenterPoint();
        theArea.setCenterPoint({
          x: center.x * ratioNewCurWidth,
          y: center.y * ratioNewCurHeight
        });
      } else {
        elCanvas.prop('width',0).prop('height',0).css({'margin-top': 0});
      }

      drawScene();

    };

    this.setAreaMinSize=function(size) {
      if (angular.isUndefined(size)) {
        return;
      } else if (typeof size == 'number' || typeof size == 'string') {
        size = {
          w: parseInt(parseInt(size), 10),
          h: parseInt(parseInt(size), 10)
        };
      } else {
        size = {
          w: parseInt(size.w, 10),
          h: parseInt(size.h, 10)
        };
      }
      if (!isNaN(size.w) && !isNaN(size.h)) {
        theArea.setMinSize(size);
        drawScene();
      }
    };

    this.setAreaMinRelativeSize = function(size) {
      if (image !== null) {
        var canvasSize = theArea.getCanvasSize();
        if (angular.isUndefined(size)) {
          return;
        } else if(typeof size == 'number' || typeof size == 'string') {
          areaMinRelativeSize = {
            w: size,
            h: size
          };
          size = {
            w: canvasSize.w/(image.width/parseInt(parseInt(size), 10)),
            h: canvasSize.h/(image.height/parseInt(parseInt(size), 10))
          };
        } else{
          areaMinRelativeSize = size;
          size = {
            w: canvasSize.w/(image.width/parseInt(parseInt(size.w), 10)),
            h: canvasSize.h/(image.height/parseInt(parseInt(size.h), 10))
          };
        }
        if (!isNaN(size.w) && !isNaN(size.h)) {
          theArea.setMinSize(size);
          drawScene();
        }
      }
    };

    this.setAreaInitSize = function(size) {
      if (angular.isUndefined(size)) {
        return;
      }else if(typeof size == 'number' || typeof size == 'string'){
        size = {
          w: parseInt(parseInt(size), 10),
          h: parseInt(parseInt(size), 10)
        };
      }else{
        size = {
          w: parseInt(size.w, 10),
          h: parseInt(size.h, 10)
        };
      }
      if (!isNaN(size.w) && !isNaN(size.h)) {
        theArea.setInitSize(size);
        drawScene();
      }
    };

    this.getResultImageSize = function() {
      if (resImgSize == "selection") {
        return theArea.getSize();
      }else if(resImgSize == "max") {
        // We maximize the rendered size
        var zoom = 1;
        if (image && ctx && ctx.canvas) {
          zoom = image.width / ctx.canvas.width;
        }
        var size = {
          w: zoom * theArea.getSize().w,
          h: zoom * theArea.getSize().h
        };

        if (areaMinRelativeSize) {
          if (size.w < areaMinRelativeSize.w) {
            size.w = areaMinRelativeSize.w;
          }
          if (size.h < areaMinRelativeSize.h) {
            size.h = areaMinRelativeSize.h;
          }
        }

        return size;
      }

      return resImgSize;
    };

    this.setResultImageSize=function(size) {
      if(angular.isArray(size)){
        resImgSizeArray=size.slice();
        size = {
          w: parseInt(size[0].w, 10),
          h: parseInt(size[0].h, 10)
        };
        return;
      }
      if (angular.isUndefined(size)) {
        return;
      }
      //allow setting of size to "selection" for mirroring selection's dimensions
      if (angular.isString(size)) {
        resImgSize = size;
        return;
      }
      //allow scalar values for square-like selection shapes
      if (angular.isNumber(size)) {
        size = parseInt(size, 10);
        size = {
          w: size,
          h: size
        };
      }
      size = {
        w: parseInt(size.w, 10),
        h: parseInt(size.h, 10)
      };
      if (!isNaN(size.w) && !isNaN(size.h)) {
        resImgSize = size;
        drawScene();
      }
    };

    this.setResultImageFormat=function(format) {
      resImgFormat = format;
    };

    this.setResultImageQuality=function(quality){
      quality = parseFloat(quality);
      if (!isNaN(quality) && quality>=0 && quality<=1){
        resImgQuality = quality;
      }
    };

    this.getAreaType = function() {
      return theArea.getType();
    };

    this.setAreaType = function(type) {
      var center = theArea.getCenterPoint();
      var curSize = theArea.getSize(),
        curMinSize = theArea.getMinSize(),
        curX = center.x,
        curY = center.y;

      var AreaClass = CropAreaCircle;
      if (type === 'square') {
        AreaClass = CropAreaSquare;
      } else if (type === 'rectangle') {
        AreaClass = CropAreaRectangle;
      }
      theArea = new AreaClass(ctx, events);
      theArea.setMinSize(curMinSize);
      theArea.setSize(curSize);
      if (type === 'square' || type === 'circle') {
        forceAspectRatio = true;
        theArea.setForceAspectRatio(true);
      }else{
        forceAspectRatio = false;
        theArea.setForceAspectRatio(false);
      }

      theArea.setCenterPoint({
        x: curX,
        y: curY
      });

      // resetCropHost();
      if (image !== null) {
        theArea.setImage(image);
      }

      drawScene();
    };

    this.setAspect = function(aspect) {
      isAspectRatio = true;
      theArea.setAspect(aspect);
      var minSize = theArea.getMinSize();
      minSize.w = minSize.h*aspect;
      theArea.setMinSize(minSize);
      var size = theArea.getSize();
      size.w = size.h*aspect;
      theArea.setSize(size);
    };

    /* Life Cycle begins */

    // Init Context var
    ctx = elCanvas[0].getContext('2d');

    // Init CropArea
    theArea = new CropAreaCircle(ctx, events);

    // Init Mouse Event Listeners
    $document.on('mousemove',onMouseMove);
    elCanvas.on('mousedown',onMouseDown);
    $document.on('mouseup',onMouseUp);

    // Init Touch Event Listeners
    $document.on('touchmove',onMouseMove);
    elCanvas.on('touchstart',onMouseDown);
    $document.on('touchend',onMouseUp);

    // CropHost Destructor
    this.destroy=function() {
      $document.off('mousemove',onMouseMove);
      elCanvas.off('mousedown',onMouseDown);
      $document.off('mouseup',onMouseMove);

      $document.off('touchmove',onMouseMove);
      elCanvas.off('touchstart',onMouseDown);
      $document.off('touchend',onMouseMove);

      elCanvas.remove();
    };
  };

}]);
