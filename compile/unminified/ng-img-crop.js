/*!
 * ngImgCrop v0.3.2
 * https://github.com/alexk111/ngImgCrop
 *
 * Copyright (c) 2016 Alex Kaul
 * License: MIT
 *
 * Generated at Friday, April 1st, 2016, 4:44:03 PM
 */
(function() {
'use strict';

var crop = angular.module('ngImgCrop', []);

crop.factory('cropAreaCircle', ['cropArea', function(CropArea) {
  var CropAreaCircle = function() {
    CropArea.apply(this, arguments);

    this._boxResizeBaseSize = 20;
    this._boxResizeNormalRatio = 0.9;
    this._boxResizeHoverRatio = 1.2;
    this._iconMoveNormalRatio = 0.9;
    this._iconMoveHoverRatio = 1.2;

    this._boxResizeNormalSize = this._boxResizeBaseSize * this._boxResizeNormalRatio;
    this._boxResizeHoverSize = this._boxResizeBaseSize * this._boxResizeHoverRatio;

    this._posDragStartX = 0;
    this._posDragStartY = 0;
    this._posResizeStartX = 0;
    this._posResizeStartY = 0;
    this._posResizeStartSize = 0;

    this._boxResizeIsHover = false;
    this._areaIsHover = false;
    this._boxResizeIsDragging = false;
    this._areaIsDragging = false;
  };

  CropAreaCircle.prototype = new CropArea();

  CropAreaCircle.prototype.getType = function() {
    return 'circle';
  };

  CropAreaCircle.prototype._calcCirclePerimeterCoords = function(angleDegrees) {
    var hSize = this._size.w / 2;
    var angleRadians = angleDegrees * (Math.PI / 180),
      circlePerimeterX = this.getCenterPoint().x + hSize * Math.cos(angleRadians),
      circlePerimeterY = this.getCenterPoint().y + hSize * Math.sin(angleRadians);
    return [circlePerimeterX, circlePerimeterY];
  };

  CropAreaCircle.prototype._calcResizeIconCenterCoords = function() {
    return this._calcCirclePerimeterCoords(-45);
  };

  CropAreaCircle.prototype._isCoordWithinArea = function(coord) {
    return Math.sqrt((coord[0] - this.getCenterPoint().x) * (coord[0] - this.getCenterPoint().x) + (coord[1] - this.getCenterPoint().y) * (coord[1] - this.getCenterPoint().y)) < this._size.w / 2;
  };
  CropAreaCircle.prototype._isCoordWithinBoxResize = function(coord) {
    var resizeIconCenterCoords = this._calcResizeIconCenterCoords();
    var hSize = this._boxResizeHoverSize / 2;
    return (coord[0] > resizeIconCenterCoords[0] - hSize && coord[0] < resizeIconCenterCoords[0] + hSize &&
    coord[1] > resizeIconCenterCoords[1] - hSize && coord[1] < resizeIconCenterCoords[1] + hSize);
  };

  CropAreaCircle.prototype._drawArea = function(ctx, centerCoords, size) {
    ctx.arc(centerCoords.x, centerCoords.y, size.w / 2, 0, 2 * Math.PI);
  };

  CropAreaCircle.prototype.draw = function() {
    CropArea.prototype.draw.apply(this, arguments);

    // draw move icon
    var center = this.getCenterPoint();
    this._cropCanvas.drawIconMove([center.x, center.y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);

    // draw resize cubes
    this._cropCanvas.drawIconResizeBoxNESW(this._calcResizeIconCenterCoords(), this._boxResizeBaseSize, this._boxResizeIsHover ? this._boxResizeHoverRatio : this._boxResizeNormalRatio);
  };

  CropAreaCircle.prototype.processMouseMove = function(mouseCurX, mouseCurY) {
    var cursor = 'default';
    var res = false;

    this._boxResizeIsHover = false;
    this._areaIsHover = false;

    if (this._areaIsDragging) {
      this.setCenterPointOnMove({
        x: mouseCurX - this._posDragStartX,
        y: mouseCurY - this._posDragStartY
      });
      this._areaIsHover = true;
      cursor = 'move';
      res = true;
      this._events.trigger('area-move');
    } else if (this._boxResizeIsDragging) {
      cursor = 'nesw-resize';
      var iFR, iFX, iFY;
      iFX = mouseCurX - this._posResizeStartX;
      iFY = this._posResizeStartY - mouseCurY;
      if (iFX > iFY) {
        iFR = this._posResizeStartSize.w + iFY * 2;
      } else {
        iFR = this._posResizeStartSize.w + iFX * 2;
      }

      var center = this.getCenterPoint(),
        newNO = {},
        newSE = {};

      newNO.x = this.getCenterPoint().x - iFR * 0.5;
      newSE.x = this.getCenterPoint().x + iFR * 0.5;

      newNO.y = this.getCenterPoint().y - iFR * 0.5;
      newSE.y = this.getCenterPoint().y + iFR * 0.5;

      this.CircleOnMove(newNO, newSE);
      this._boxResizeIsHover = true;
      res = true;
      this._events.trigger('area-resize');
    } else if (this._isCoordWithinBoxResize([mouseCurX, mouseCurY])) {
      cursor = 'nesw-resize';
      this._areaIsHover = false;
      this._boxResizeIsHover = true;
      res = true;
    } else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
      cursor = 'move';
      this._areaIsHover = true;
      res = true;
    }

    //this._dontDragOutside();
    angular.element(this._ctx.canvas).css({
      'cursor': cursor
    });

    return res;
  };

  CropAreaCircle.prototype.processMouseDown = function(mouseDownX, mouseDownY) {
    if (this._isCoordWithinBoxResize([mouseDownX, mouseDownY])) {
      this._areaIsDragging = false;
      this._areaIsHover = false;
      this._boxResizeIsDragging = true;
      this._boxResizeIsHover = true;
      this._posResizeStartX = mouseDownX;
      this._posResizeStartY = mouseDownY;
      this._posResizeStartSize = this._size;
      this._events.trigger('area-resize-start');
    } else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
      this._areaIsDragging = true;
      this._areaIsHover = true;
      this._boxResizeIsDragging = false;
      this._boxResizeIsHover = false;
      var center = this.getCenterPoint();
      this._posDragStartX = mouseDownX - center.x;
      this._posDragStartY = mouseDownY - center.y;
      this._events.trigger('area-move-start');
    }
  };

  CropAreaCircle.prototype.processMouseUp = function( /*mouseUpX, mouseUpY*/ ) {
    if (this._areaIsDragging) {
      this._areaIsDragging = false;
      this._events.trigger('area-move-end');
    }
    if (this._boxResizeIsDragging) {
      this._boxResizeIsDragging = false;
      this._events.trigger('area-resize-end');
    }
    this._areaIsHover = false;
    this._boxResizeIsHover = false;

    this._posDragStartX = 0;
    this._posDragStartY = 0;
  };

  return CropAreaCircle;
}]);

crop.factory('cropAreaRectangle', ['cropArea', function (CropArea) {
  var CropAreaRectangle = function () {
    CropArea.apply(this, arguments);

    this._resizeCtrlBaseRadius = 15;
    this._resizeCtrlNormalRatio = 0.75;
    this._resizeCtrlHoverRatio = 1;
    this._iconMoveNormalRatio = 0.9;
    this._iconMoveHoverRatio = 1.2;

    this._resizeCtrlNormalRadius = this._resizeCtrlBaseRadius * this._resizeCtrlNormalRatio;
    this._resizeCtrlHoverRadius = this._resizeCtrlBaseRadius * this._resizeCtrlHoverRatio;

    this._posDragStartX = 0;
    this._posDragStartY = 0;
    this._posResizeStartX = 0;
    this._posResizeStartY = 0;
    this._posResizeStartSize = {
      w: 0,
      h: 0
    };

    this._resizeCtrlIsHover = -1;
    this._areaIsHover = false;
    this._resizeCtrlIsDragging = -1;
    this._areaIsDragging = false;
  };

  CropAreaRectangle.prototype = new CropArea();

  // return a type string
  CropAreaRectangle.prototype.getType = function () {
    return 'rectangle';
  };

  CropAreaRectangle.prototype._calcRectangleCorners = function () {
    var size = this.getSize();
    var se = this.getSouthEastBound();
    return [
      [size.x, size.y], //northwest
      [se.x, size.y], //northeast
      [size.x, se.y], //southwest
      [se.x, se.y] //southeast
    ];
  };

  CropAreaRectangle.prototype._calcRectangleDimensions = function () {
    var size = this.getSize();
    var se = this.getSouthEastBound();
    return {
      left: size.x,
      top: size.y,
      right: se.x,
      bottom: se.y
    };
  };

  CropAreaRectangle.prototype._isCoordWithinArea = function (coord) {
    var rectangleDimensions = this._calcRectangleDimensions();
    return (coord[0] >= rectangleDimensions.left && coord[0] <= rectangleDimensions.right && coord[1] >= rectangleDimensions.top && coord[1] <= rectangleDimensions.bottom);
  };

  CropAreaRectangle.prototype._isCoordWithinResizeCtrl = function (coord) {
    var resizeIconsCenterCoords = this._calcRectangleCorners();
    var res = -1;
    for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
      var resizeIconCenterCoords = resizeIconsCenterCoords[i];
      if (coord[0] > resizeIconCenterCoords[0] - this._resizeCtrlHoverRadius && coord[0] < resizeIconCenterCoords[0] + this._resizeCtrlHoverRadius &&
        coord[1] > resizeIconCenterCoords[1] - this._resizeCtrlHoverRadius && coord[1] < resizeIconCenterCoords[1] + this._resizeCtrlHoverRadius) {
        res = i;
        break;
      }
    }
    return res;
  };

  CropAreaRectangle.prototype._drawArea = function (ctx, center, size) {
    ctx.rect(size.x, size.y, size.w, size.h);
  };

  CropAreaRectangle.prototype.draw = function () {
    CropArea.prototype.draw.apply(this, arguments);

    var center = this.getCenterPoint();
    // draw move icon
    this._cropCanvas.drawIconMove([center.x, center.y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);

    // draw resize thumbs
    var resizeIconsCenterCoords = this._calcRectangleCorners();
    for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
      var resizeIconCenterCoords = resizeIconsCenterCoords[i];
      this._cropCanvas.drawIconResizeCircle(resizeIconCenterCoords, this._resizeCtrlBaseRadius, this._resizeCtrlIsHover === i ? this._resizeCtrlHoverRatio : this._resizeCtrlNormalRatio);
    }
  };

  CropAreaRectangle.prototype.processMouseMove = function (mouseCurX, mouseCurY) {
    var cursor = 'default';
    var res = false;

    this._resizeCtrlIsHover = -1;
    this._areaIsHover = false;

    if (this._areaIsDragging) {
      this.setCenterPointOnMove({
        x: mouseCurX - this._posDragStartX,
        y: mouseCurY - this._posDragStartY
      });
      this._areaIsHover = true;
      cursor = 'move';
      res = true;
      this._events.trigger('area-move');
    } else if (this._resizeCtrlIsDragging > -1) {
      var s = this.getSize();
      var se = this.getSouthEastBound();
      var posX = mouseCurX;
      switch (this._resizeCtrlIsDragging) {
        case 0: // Top Left
          if (this._aspect) posX = se.x - ((se.y - mouseCurY) * this._aspect);
          this.setSizeByCorners({
            x: posX,
            y: mouseCurY
          }, {
            x: se.x,
            y: se.y
          });
          cursor = 'nwse-resize';
          break;
        case 1: // Top Right
          if (this._aspect) posX = s.x + ((se.y - mouseCurY) * this._aspect);
          this.setSizeByCorners({
            x: s.x,
            y: mouseCurY
          }, {
            x: posX,
            y: se.y
          });
          cursor = 'nesw-resize';
          break;
        case 2: // Bottom Left
          if (this._aspect) posX = se.x - ((mouseCurY - s.y) * this._aspect);
          this.setSizeByCorners({
            x: posX,
            y: s.y
          }, {
            x: se.x,
            y: mouseCurY
          });
          cursor = 'nesw-resize';
          break;
        case 3: // Bottom Right
          if (this._aspect) posX = s.x + ((mouseCurY - s.y) * this._aspect);
          this.setSizeByCorners({
            x: s.x,
            y: s.y
          }, {
            x: posX,
            y: mouseCurY
          });
          cursor = 'nwse-resize';
          break;
      }

      this._resizeCtrlIsHover = this._resizeCtrlIsDragging;
      res = true;
      this._events.trigger('area-resize');
    } else {
      var hoveredResizeBox = this._isCoordWithinResizeCtrl([mouseCurX, mouseCurY]);
      if (hoveredResizeBox > -1) {
        switch (hoveredResizeBox) {
          case 0:
            cursor = 'nwse-resize';
            break;
          case 1:
            cursor = 'nesw-resize';
            break;
          case 2:
            cursor = 'nesw-resize';
            break;
          case 3:
            cursor = 'nwse-resize';
            break;
        }
        this._areaIsHover = false;
        this._resizeCtrlIsHover = hoveredResizeBox;
        res = true;
      } else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
        cursor = 'move';
        this._areaIsHover = true;
        res = true;
      }
    }

    angular.element(this._ctx.canvas).css({
      'cursor': cursor
    });

    return res;
  };

  CropAreaRectangle.prototype.processMouseDown = function (mouseDownX, mouseDownY) {
    var isWithinResizeCtrl = this._isCoordWithinResizeCtrl([mouseDownX, mouseDownY]);
    if (isWithinResizeCtrl > -1) {
      this._areaIsDragging = false;
      this._areaIsHover = false;
      this._resizeCtrlIsDragging = isWithinResizeCtrl;
      this._resizeCtrlIsHover = isWithinResizeCtrl;
      this._posResizeStartX = mouseDownX;
      this._posResizeStartY = mouseDownY;
      this._posResizeStartSize = this._size;
      this._events.trigger('area-resize-start');
    } else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
      this._areaIsDragging = true;
      this._areaIsHover = true;
      this._resizeCtrlIsDragging = -1;
      this._resizeCtrlIsHover = -1;
      var center = this.getCenterPoint();
      this._posDragStartX = mouseDownX - center.x;
      this._posDragStartY = mouseDownY - center.y;
      this._events.trigger('area-move-start');
    }
  };

  CropAreaRectangle.prototype.processMouseUp = function (/*mouseUpX, mouseUpY*/) {
    if (this._areaIsDragging) {
      this._areaIsDragging = false;
      this._events.trigger('area-move-end');
    }
    if (this._resizeCtrlIsDragging > -1) {
      this._resizeCtrlIsDragging = -1;
      this._events.trigger('area-resize-end');
    }
    this._areaIsHover = false;
    this._resizeCtrlIsHover = -1;

    this._posDragStartX = 0;
    this._posDragStartY = 0;
  };

  return CropAreaRectangle;
}]);

crop.factory('cropAreaSquare', ['cropArea', function(CropArea) {
  var CropAreaSquare = function() {
    CropArea.apply(this, arguments);

    this._resizeCtrlBaseRadius = 10;
    this._resizeCtrlNormalRatio = 0.75;
    this._resizeCtrlHoverRatio = 1;
    this._iconMoveNormalRatio = 0.9;
    this._iconMoveHoverRatio = 1.2;

    this._resizeCtrlNormalRadius = this._resizeCtrlBaseRadius * this._resizeCtrlNormalRatio;
    this._resizeCtrlHoverRadius = this._resizeCtrlBaseRadius * this._resizeCtrlHoverRatio;

    this._posDragStartX = 0;
    this._posDragStartY = 0;
    this._posResizeStartX = 0;
    this._posResizeStartY = 0;
    this._posResizeStartSize = 0;

    this._resizeCtrlIsHover = -1;
    this._areaIsHover = false;
    this._resizeCtrlIsDragging = -1;
    this._areaIsDragging = false;
  };

  CropAreaSquare.prototype = new CropArea();

  CropAreaSquare.prototype.getType = function() {
    return 'square';
  };

  CropAreaSquare.prototype._calcSquareCorners = function() {
    var size = this.getSize(),
      se = this.getSouthEastBound();
    return [
      [size.x, size.y], //northwest
      [se.x, size.y], //northeast
      [size.x, se.y], //southwest
      [se.x, se.y] //southeast
    ];
  };

  CropAreaSquare.prototype._calcSquareDimensions = function() {
    var size = this.getSize(),
      se = this.getSouthEastBound();
    return {
      left: size.x,
      top: size.y,
      right: se.x,
      bottom: se.y
    };
  };

  CropAreaSquare.prototype._isCoordWithinArea = function(coord) {
    var squareDimensions = this._calcSquareDimensions();
    return (coord[0] >= squareDimensions.left && coord[0] <= squareDimensions.right && coord[1] >= squareDimensions.top && coord[1] <= squareDimensions.bottom);
  };

  CropAreaSquare.prototype._isCoordWithinResizeCtrl = function(coord) {
    var resizeIconsCenterCoords = this._calcSquareCorners();
    var res = -1;
    for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
      var resizeIconCenterCoords = resizeIconsCenterCoords[i];
      if (coord[0] > resizeIconCenterCoords[0] - this._resizeCtrlHoverRadius && coord[0] < resizeIconCenterCoords[0] + this._resizeCtrlHoverRadius &&
        coord[1] > resizeIconCenterCoords[1] - this._resizeCtrlHoverRadius && coord[1] < resizeIconCenterCoords[1] + this._resizeCtrlHoverRadius) {
        res = i;
        break;
      }
    }
    return res;
  };

  CropAreaSquare.prototype._drawArea = function(ctx, centerCoords, size) {
    var hSize = size / 2;
    ctx.rect(size.x, size.y, size.w, size.h);
  };

  CropAreaSquare.prototype.draw = function() {
    CropArea.prototype.draw.apply(this, arguments);

    // draw move icon
    var center = this.getCenterPoint();
    this._cropCanvas.drawIconMove([center.x, center.y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);

    // draw resize cubes
    var resizeIconsCenterCoords = this._calcSquareCorners();
    for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
      var resizeIconCenterCoords = resizeIconsCenterCoords[i];
      this._cropCanvas.drawIconResizeCircle(resizeIconCenterCoords, this._resizeCtrlBaseRadius, this._resizeCtrlIsHover === i ? this._resizeCtrlHoverRatio : this._resizeCtrlNormalRatio);
    }
  };

  CropAreaSquare.prototype.processMouseMove = function(mouseCurX, mouseCurY) {
    var cursor = 'default';
    var res = false;

    this._resizeCtrlIsHover = -1;
    this._areaIsHover = false;

    if (this._areaIsDragging) {
      this.setCenterPointOnMove({
        x: mouseCurX - this._posDragStartX,
        y: mouseCurY - this._posDragStartY
      });
      this._areaIsHover = true;
      cursor = 'move';
      res = true;
      this._events.trigger('area-move');
    } else if (this._resizeCtrlIsDragging > -1) {
      var xMulti, yMulti;
      switch (this._resizeCtrlIsDragging) {
        case 0: // Top Left
          xMulti = -1;
          yMulti = -1;
          cursor = 'nwse-resize';
          break;
        case 1: // Top Right
          xMulti = 1;
          yMulti = -1;
          cursor = 'nesw-resize';
          break;
        case 2: // Bottom Left
          xMulti = -1;
          yMulti = 1;
          cursor = 'nesw-resize';
          break;
        case 3: // Bottom Right
          xMulti = 1;
          yMulti = 1;
          cursor = 'nwse-resize';
          break;
      }
      var iFX = (mouseCurX - this._posResizeStartX) * xMulti,
        iFY = (mouseCurY - this._posResizeStartY) * yMulti,
        iFR;
      if (iFX > iFY) {
        iFR = this._posResizeStartSize.w + iFY;
      } else {
        iFR = this._posResizeStartSize.w + iFX;
      }
      var newSize = Math.max(this._minSize.w, iFR),
        newNO = {},
        newSE = {},
        newSO = {},
        newNE = {},
        s = this.getSize(),
        se = this.getSouthEastBound();
      switch (this._resizeCtrlIsDragging) {
        case 0: // Top Left
          newNO.x = se.x - newSize;
          newNO.y = se.y - newSize;
          if(newNO.y > 0) {
            this.setSizeByCorners(newNO, {
              x: se.x,
              y: se.y
            });
          }
          cursor = 'nwse-resize';
          break;
        case 1: // Top Right
          if(iFX >= 0 && iFY >= 0) {
            //Move to top/right, increase
            newNE.x = s.x + newSize;
            newNE.y = se.y - newSize;
          } else if(iFX < 0 || iFY < 0) {
            //else decrease
            newNE.x = s.x + newSize;
            newNE.y = se.y - newSize;
          }
          if(newNE.y > 0) {
            this.setSizeByCorners({
              x: s.x,
              y: newNE.y
            }, {
              x: newNE.x,
              y: se.y
            });
          }
          cursor = 'nesw-resize';
          break;
        case 2: // Bottom Left
          if(iFX >= 0 && iFY >= 0) {
            //Move to bottom/left, increase
            newSO.x = se.x - newSize;
            newSO.y = s.y + newSize;
          } else if(iFX <= 0 || iFY <= 0) {
            //else decrease
            newSO.x = se.x - newSize;
            newSO.y = s.y + newSize;
          }
          if(newSO.y < this._ctx.canvas.height) {
            this.setSizeByCorners({
              x: newSO.x,
              y: s.y
            }, {
              x: se.x,
              y: newSO.y
            });
          }
          cursor = 'nesw-resize';
          break;
        case 3: // Bottom Right

          newSE.x = s.x + newSize;
          newSE.y = s.y + newSize;

          if(newSE.y < this._ctx.canvas.height) {
            this.setSizeByCorners({
              x: s.x,
              y: s.y
            }, newSE);
          }
          cursor = 'nwse-resize';
          break;
      }
      this._resizeCtrlIsHover = this._resizeCtrlIsDragging;
      res = true;
      this._events.trigger('area-resize');
    } else {
      var hoveredResizeBox = this._isCoordWithinResizeCtrl([mouseCurX, mouseCurY]);
      if (hoveredResizeBox > -1) {
        switch (hoveredResizeBox) {
          case 0:
            cursor = 'nwse-resize';
            break;
          case 1:
            cursor = 'nesw-resize';
            break;
          case 2:
            cursor = 'nesw-resize';
            break;
          case 3:
            cursor = 'nwse-resize';
            break;
        }
        this._areaIsHover = false;
        this._resizeCtrlIsHover = hoveredResizeBox;
        res = true;
      } else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
        cursor = 'move';
        this._areaIsHover = true;
        res = true;
      }
    }

    angular.element(this._ctx.canvas).css({
      'cursor': cursor
    });

    return res;
  };

  CropAreaSquare.prototype.processMouseDown = function(mouseDownX, mouseDownY) {
    var isWithinResizeCtrl = this._isCoordWithinResizeCtrl([mouseDownX, mouseDownY]);
    if (isWithinResizeCtrl > -1) {
      this._areaIsDragging = false;
      this._areaIsHover = false;
      this._resizeCtrlIsDragging = isWithinResizeCtrl;
      this._resizeCtrlIsHover = isWithinResizeCtrl;
      this._posResizeStartX = mouseDownX;
      this._posResizeStartY = mouseDownY;
      this._posResizeStartSize = this._size;
      this._events.trigger('area-resize-start');
    } else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
      this._areaIsDragging = true;
      this._areaIsHover = true;
      this._resizeCtrlIsDragging = -1;
      this._resizeCtrlIsHover = -1;
      var center = this.getCenterPoint();
      this._posDragStartX = mouseDownX - center.x;
      this._posDragStartY = mouseDownY - center.y;
      this._events.trigger('area-move-start');
    }
  };

  CropAreaSquare.prototype.processMouseUp = function( /*mouseUpX, mouseUpY*/ ) {
    if (this._areaIsDragging) {
      this._areaIsDragging = false;
      this._events.trigger('area-move-end');
    }
    if (this._resizeCtrlIsDragging > -1) {
      this._resizeCtrlIsDragging = -1;
      this._events.trigger('area-resize-end');
    }
    this._areaIsHover = false;
    this._resizeCtrlIsHover = -1;

    this._posDragStartX = 0;
    this._posDragStartY = 0;
  };

  return CropAreaSquare;
}]);

crop.factory('cropArea', ['cropCanvas', function(CropCanvas) {
  var CropArea = function(ctx, events) {
    this._ctx = ctx;
    this._events = events;

    this._minSize = {
      x: 0,
      y: 0,
      w: 80,
      h: 80
    };

    this._initSize = undefined;
    this._allowCropResizeOnCorners = false;

    this._forceAspectRatio = false;
    this._aspect = null;

    this._cropCanvas = new CropCanvas(ctx);

    this._image = new Image();
    this._size = {
      x: 0,
      y: 0,
      w: 150,
      h: 150
    };
  };

  /* GETTERS/SETTERS */

  CropArea.prototype.setAllowCropResizeOnCorners = function(bool) {
    this._allowCropResizeOnCorners=bool;
  };

  CropArea.prototype.getX = function () {
    return this._x;
  };
  CropArea.prototype.setX = function (x) {
    this._x = x;
    this._dontDragOutside();
  };

  CropArea.prototype.getY = function () {
    return this._y;
  };
  CropArea.prototype.setY = function (y) {
    this._y = y;
    this._dontDragOutside();
  };

  CropArea.prototype.getImage = function() {
    return this._image;
  };
  CropArea.prototype.setImage = function(image) {
    this._image = image;
  };

  CropArea.prototype.setForceAspectRatio = function(force) {
    this._forceAspectRatio = force;
  };

  CropArea.prototype.setAspect = function(aspect) {
    this._aspect=aspect;
  };

  CropArea.prototype.getAspect = function() {
    return this._aspect;
  };

  CropArea.prototype.getCanvasSize = function() {
    return {
      w: this._ctx.canvas.width,
      h: this._ctx.canvas.height
    };
  };

  CropArea.prototype.getSize = function() {
    return this._size;
  };

  CropArea.prototype.setSize = function(size) {
    size = this._processSize(size);
    this._size = this._preventBoundaryCollision(size);
  };

  CropArea.prototype.setSizeOnMove = function(size) {
    size = this._processSize(size);
    if(this._allowCropResizeOnCorners) this._size = this._preventBoundaryCollision(size);
    else this._size = this._allowMouseOutsideCanvas(size);
  };

  CropArea.prototype.CircleOnMove = function(northWestCorner, southEastCorner) {
    var size = {
      x: northWestCorner.x,
      y: northWestCorner.y,
      w: southEastCorner.x - northWestCorner.x,
      h: southEastCorner.y - northWestCorner.y
    };
    var canvasH = this._ctx.canvas.height,
      canvasW = this._ctx.canvas.width;
    if(size.w>canvasW||size.h>canvasH){
      if(canvasW<canvasH){
        size.w=canvasW;
        size.h=canvasW;
      }else{
        size.w=canvasH;
        size.h=canvasH;
      }
    }
    if(size.x+size.w>canvasW){
      size.x=canvasW-size.w;
    }
    if(size.y+size.h>canvasH){
      size.y=canvasH-size.h;
    }
    if(size.x<0) size.x=0;
    if(size.y<0) size.y=0;
    if(this._minSize.w>size.w){
      size.w=this._minSize.w;
      size.x=this._size.x;
    }
    if(this._minSize.h>size.h){
      size.h=this._minSize.h;
      size.y=this._size.y;
    }
    this._size=size;
  };

  CropArea.prototype.setSizeByCorners = function(northWestCorner, southEastCorner) {

    var size = {
      x: northWestCorner.x,
      y: northWestCorner.y,
      w: southEastCorner.x - northWestCorner.x,
      h: southEastCorner.y - northWestCorner.y
    };
    this.setSize(size);
  };

  CropArea.prototype.getSouthEastBound = function() {
    return this._southEastBound(this.getSize());
  };

  CropArea.prototype.setMinSize = function(size) {
    this._minSize = this._processSize(size);
    this.setSize(this._minSize);
  };

  CropArea.prototype.getMinSize = function() {
    return this._minSize;
  };

  CropArea.prototype.getCenterPoint = function() {
    var s = this.getSize();
    return {
      x: s.x + (s.w / 2),
      y: s.y + (s.h / 2)
    };
  };

  CropArea.prototype.setCenterPoint = function(point) {
    var s = this.getSize();
    this.setSize({
      x: point.x - s.w / 2,
      y: point.y - s.h / 2,
      w: s.w,
      h: s.h
    });
  };

  CropArea.prototype.setCenterPointOnMove = function(point) {
    var s = this.getSize();
    this.setSizeOnMove({
      x: point.x - s.w / 2,
      y: point.y - s.h / 2,
      w: s.w,
      h: s.h
    });
  };

  CropArea.prototype.setInitSize = function(size) {
    this._initSize = this._processSize(size);
    this.setSize(this._initSize);
  };

  CropArea.prototype.getInitSize = function() {
    return this._initSize;
  };

  // return a type string
  CropArea.prototype.getType = function() {
    //default to circle
    return 'circle';
  };

  /* FUNCTIONS */
  CropArea.prototype._allowMouseOutsideCanvas = function(size) {
    var canvasH = this._ctx.canvas.height,
      canvasW = this._ctx.canvas.width;
    var newSize = {
      w: size.w,
      h: size.h,
    };
    if(size.x<0) newSize.x=0;
    else if(size.x+size.w>canvasW) newSize.x=canvasW-size.w;
    else newSize.x=size.x;
    if(size.y<0) newSize.y=0;
    else if(size.y+size.h>canvasH) newSize.y=canvasH-size.h;
    else newSize.y=size.y;
    return newSize;
  };
  CropArea.prototype._preventBoundaryCollision = function(size) {
    var canvasH = this._ctx.canvas.height,
      canvasW = this._ctx.canvas.width;

    var nw = {
      x: size.x,
      y: size.y
    };
    var se = this._southEastBound(size);

    // check northwest corner
    if (nw.x < 0) {
      nw.x = 0;
    }
    if (nw.y < 0) {
      nw.y = 0;
    }

    // check southeast corner
    if (se.x > canvasW) {
      se.x = canvasW
    }
    if (se.y > canvasH) {
      se.y = canvasH
    }

    var newSizeWidth = (this._forceAspectRatio) ? size.w : se.x - nw.x,
      newSizeHeight = (this._forceAspectRatio) ? size.h : se.y - nw.y;

    // save rectangle scale
    if(this._aspect){
      newSizeWidth = newSizeHeight * this._aspect;
      if(nw.x+newSizeWidth>canvasW){
        newSizeWidth=canvasW-nw.x;
        newSizeHeight=newSizeWidth/this._aspect;
        if(this._minSize.w>newSizeWidth) newSizeWidth=this._minSize.w;
        if(this._minSize.h>newSizeHeight) newSizeHeight=this._minSize.h;
        nw.x=canvasW-newSizeWidth;
      }
      if(nw.y+newSizeHeight>canvasH) nw.y=canvasH-newSizeHeight;
    }

    // save square scale
    if(this._forceAspectRatio) {
      newSizeWidth = newSizeHeight;
      if(nw.x+newSizeWidth>canvasW){
        newSizeWidth=canvasW-nw.x;
        if(newSizeWidth<this._minSize.w) newSizeWidth=this._minSize.w;
        newSizeHeight=newSizeWidth;
      }
    }

    var newSize = {
      x: nw.x,
      y: nw.y,
      w: newSizeWidth,
      h: newSizeHeight
    };

    //check size (if < min, adjust nw corner)
    if ( (newSize.w < this._minSize.w) && !this._forceAspectRatio) {
      newSize.w = this._minSize.w;
      se = this._southEastBound(newSize);
      //adjust se corner, if it's out of bounds
      if (se.x > canvasW) {
        se.x = canvasW;
        //adjust nw corner according to min width
        nw.x = Math.max(se.x - canvasW, se.x - this._minSize.w);
        newSize = {
          x: nw.x,
          y: nw.y,
          w: se.x - nw.x,
          h: se.y - nw.y
        };
      }
    }

    if ( (newSize.h < this._minSize.h) && !this._forceAspectRatio) {
      newSize.h = this._minSize.h;
      se = this._southEastBound(newSize);

      if (se.y > canvasH) {
        se.y = canvasH;
        //adjust nw corner according to min height
        nw.y = Math.max(se.y - canvasH, se.y - this._minSize.h);
        newSize = {
          x: nw.x,
          y: nw.y,
          w: se.x - nw.x,
          h: se.y - nw.y
        };
      }
    }

    if(this._forceAspectRatio) {
      //check if outside SE bound
      se = this._southEastBound(newSize);
      if (se.y > canvasH) {
        newSize.y = canvasH - newSize.h;
      }
      if (se.x > canvasW) {
        newSize.x = canvasW - newSize.w;
      }
    }

    return newSize;
  };

  CropArea.prototype._dontDragOutside = function() {
    var h = this._ctx.canvas.height,
      w = this._ctx.canvas.width;

    if (this._width > w) {
      this._width = w;
    }
    if (this._height > h) {
      this._height = h;
    }
    if (this._x < this._width / 2) {
      this._x = this._width / 2;
    }
    if (this._x > w - this._width / 2) {
      this._x = w - this._width / 2;
    }
    if (this._y < this._height / 2) {
      this._y = this._height / 2;
    }
    if (this._y > h - this._height / 2) {
      this._y = h - this._height / 2;
    }
  };

  CropArea.prototype._drawArea = function() {};

  CropArea.prototype._processSize = function(size) {
    // make this polymorphic to accept a single floating point number
    // for square-like sizes (including circle)
    if (typeof size == "number") {
      size = {
        w: size,
        h: size
      };
    }
    var width = size.w;
    if(this._aspect) width = size.h * this._aspect;
    return {
      x: size.x || this.getSize().x,
      y: size.y || this.getSize().y,
      w: width || this._minSize.w,
      h: size.h || this._minSize.h
    };
  };

  CropArea.prototype._southEastBound = function(size) {
    return {
      x: size.x + size.w,
      y: size.y + size.h
    };
  };

  CropArea.prototype.draw = function() {
    // draw crop area
    this._cropCanvas.drawCropArea(this._image, this.getCenterPoint(), this._size, this._drawArea);
  };

  CropArea.prototype.processMouseMove = function() {};

  CropArea.prototype.processMouseDown = function() {};

  CropArea.prototype.processMouseUp = function() {};

  return CropArea;
}]);

crop.factory('cropCanvas', [function() {
  // Shape = Array of [x,y]; [0, 0] - center
  var shapeArrowNW=[[-0.5,-2],[-3,-4.5],[-0.5,-7],[-7,-7],[-7,-0.5],[-4.5,-3],[-2,-0.5]];
  var shapeArrowNE=[[0.5,-2],[3,-4.5],[0.5,-7],[7,-7],[7,-0.5],[4.5,-3],[2,-0.5]];
  var shapeArrowSW=[[-0.5,2],[-3,4.5],[-0.5,7],[-7,7],[-7,0.5],[-4.5,3],[-2,0.5]];
  var shapeArrowSE=[[0.5,2],[3,4.5],[0.5,7],[7,7],[7,0.5],[4.5,3],[2,0.5]];
  var shapeArrowN=[[-1.5,-2.5],[-1.5,-6],[-5,-6],[0,-11],[5,-6],[1.5,-6],[1.5,-2.5]];
  var shapeArrowW=[[-2.5,-1.5],[-6,-1.5],[-6,-5],[-11,0],[-6,5],[-6,1.5],[-2.5,1.5]];
  var shapeArrowS=[[-1.5,2.5],[-1.5,6],[-5,6],[0,11],[5,6],[1.5,6],[1.5,2.5]];
  var shapeArrowE=[[2.5,-1.5],[6,-1.5],[6,-5],[11,0],[6,5],[6,1.5],[2.5,1.5]];

  // Colors
  var colors = {
    areaOutline: '#fff',
    resizeBoxStroke: '#fff',
    resizeBoxFill: '#444',
    resizeBoxArrowFill: '#fff',
    resizeCircleStroke: '#fff',
    resizeCircleFill: '#444',
    moveIconFill: '#fff'
  };

  return function(ctx) {

    /* Base functions */

    // Calculate Point
    var calcPoint = function(point, offset, scale) {
      return [scale * point[0] + offset[0], scale * point[1] + offset[1]];
    };

    // Draw Filled Polygon
    var drawFilledPolygon = function(shape, fillStyle, centerCoords, scale) {
      ctx.save();
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      var pc, pc0 = calcPoint(shape[0], centerCoords, scale);
      ctx.moveTo(pc0[0], pc0[1]);

      for (var p in shape) {
        if (p > 0) {
          pc = calcPoint(shape[p], centerCoords, scale);
          ctx.lineTo(pc[0], pc[1]);
        }
      }

      ctx.lineTo(pc0[0], pc0[1]);
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    };

    /* Icons */

    this.drawIconMove = function(centerCoords, scale) {
      drawFilledPolygon(shapeArrowN, colors.moveIconFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowW, colors.moveIconFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowS, colors.moveIconFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowE, colors.moveIconFill, centerCoords, scale);
    };

    this.drawIconResizeCircle = function(centerCoords, circleRadius, scale) {
      var scaledCircleRadius = circleRadius * scale;
      ctx.save();
      ctx.strokeStyle = colors.resizeCircleStroke;
      ctx.lineWidth = 2;
      ctx.fillStyle = colors.resizeCircleFill;
      ctx.beginPath();
      ctx.arc(centerCoords[0], centerCoords[1], scaledCircleRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    };

    this.drawIconResizeBoxBase = function(centerCoords, boxSize, scale) {
      var scaledBoxSize = boxSize * scale;
      ctx.save();
      ctx.strokeStyle = colors.resizeBoxStroke;
      ctx.lineWidth = 2;
      ctx.fillStyle = colors.resizeBoxFill;
      ctx.fillRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
      ctx.strokeRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
      ctx.restore();
    };
    this.drawIconResizeBoxNESW = function(centerCoords, boxSize, scale) {
      this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
      drawFilledPolygon(shapeArrowNE, colors.resizeBoxArrowFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowSW, colors.resizeBoxArrowFill, centerCoords, scale);
    };
    this.drawIconResizeBoxNWSE = function(centerCoords, boxSize, scale) {
      this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
      drawFilledPolygon(shapeArrowNW, colors.resizeBoxArrowFill, centerCoords, scale);
      drawFilledPolygon(shapeArrowSE, colors.resizeBoxArrowFill, centerCoords, scale);
    };

    /* Crop Area */

    this.drawCropArea = function(image, centerCoords, size, fnDrawClipPath) {
      var xRatio = Math.abs(image.width / ctx.canvas.width),
        yRatio = Math.abs(image.height / ctx.canvas.height),
        xLeft = Math.abs(centerCoords.x - size.w / 2),
        yTop = Math.abs(centerCoords.y - size.h / 2);

      ctx.save();
      ctx.strokeStyle = colors.areaOutline;
      ctx.lineWidth = 2;
      ctx.beginPath();
      fnDrawClipPath(ctx, centerCoords, size);
      ctx.stroke();
      ctx.clip();

      // draw part of original image
      if (size.w > 0) {
        ctx.drawImage(image, xLeft * xRatio, yTop * yRatio, Math.abs(size.w * xRatio), Math.abs(size.h * yRatio), xLeft, yTop, Math.abs(size.w), Math.abs(size.h));
      }

      ctx.beginPath();
      fnDrawClipPath(ctx, centerCoords, size);
      ctx.stroke();
      ctx.clip();

      ctx.restore();
    };

  };
}]);

/**
 * EXIF service is based on the exif-js library (https://github.com/jseidelin/exif-js)
 */

crop.service('cropEXIF', ["$http", "$q", function($http, $q) {
  var debug = false;

  var ExifTags = this.Tags = {

      // version tags
      0x9000 : "ExifVersion",             // EXIF version
      0xA000 : "FlashpixVersion",         // Flashpix format version

      // colorspace tags
      0xA001 : "ColorSpace",              // Color space information tag

      // image configuration
      0xA002 : "PixelXDimension",         // Valid width of meaningful image
      0xA003 : "PixelYDimension",         // Valid height of meaningful image
      0x9101 : "ComponentsConfiguration", // Information about channels
      0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

      // user information
      0x927C : "MakerNote",               // Any desired information written by the manufacturer
      0x9286 : "UserComment",             // Comments by user

      // related file
      0xA004 : "RelatedSoundFile",        // Name of related sound file

      // date and time
      0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
      0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
      0x9290 : "SubsecTime",              // Fractions of seconds for DateTime
      0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
      0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

      // picture-taking conditions
      0x829A : "ExposureTime",            // Exposure time (in seconds)
      0x829D : "FNumber",                 // F number
      0x8822 : "ExposureProgram",         // Exposure program
      0x8824 : "SpectralSensitivity",     // Spectral sensitivity
      0x8827 : "ISOSpeedRatings",         // ISO speed rating
      0x8828 : "OECF",                    // Optoelectric conversion factor
      0x9201 : "ShutterSpeedValue",       // Shutter speed
      0x9202 : "ApertureValue",           // Lens aperture
      0x9203 : "BrightnessValue",         // Value of brightness
      0x9204 : "ExposureBias",            // Exposure bias
      0x9205 : "MaxApertureValue",        // Smallest F number of lens
      0x9206 : "SubjectDistance",         // Distance to subject in meters
      0x9207 : "MeteringMode",            // Metering mode
      0x9208 : "LightSource",             // Kind of light source
      0x9209 : "Flash",                   // Flash status
      0x9214 : "SubjectArea",             // Location and area of main subject
      0x920A : "FocalLength",             // Focal length of the lens in mm
      0xA20B : "FlashEnergy",             // Strobe energy in BCPS
      0xA20C : "SpatialFrequencyResponse",    //
      0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
      0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
      0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
      0xA214 : "SubjectLocation",         // Location of subject in image
      0xA215 : "ExposureIndex",           // Exposure index selected on camera
      0xA217 : "SensingMethod",           // Image sensor type
      0xA300 : "FileSource",              // Image source (3 == DSC)
      0xA301 : "SceneType",               // Scene type (1 == directly photographed)
      0xA302 : "CFAPattern",              // Color filter array geometric pattern
      0xA401 : "CustomRendered",          // Special processing
      0xA402 : "ExposureMode",            // Exposure mode
      0xA403 : "WhiteBalance",            // 1 = auto white balance, 2 = manual
      0xA404 : "DigitalZoomRation",       // Digital zoom ratio
      0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
      0xA406 : "SceneCaptureType",        // Type of scene
      0xA407 : "GainControl",             // Degree of overall image gain adjustment
      0xA408 : "Contrast",                // Direction of contrast processing applied by camera
      0xA409 : "Saturation",              // Direction of saturation processing applied by camera
      0xA40A : "Sharpness",               // Direction of sharpness processing applied by camera
      0xA40B : "DeviceSettingDescription",    //
      0xA40C : "SubjectDistanceRange",    // Distance to subject

      // other tags
      0xA005 : "InteroperabilityIFDPointer",
      0xA420 : "ImageUniqueID"            // Identifier assigned uniquely to each image
  };

  var TiffTags = this.TiffTags = {
      0x0100 : "ImageWidth",
      0x0101 : "ImageHeight",
      0x8769 : "ExifIFDPointer",
      0x8825 : "GPSInfoIFDPointer",
      0xA005 : "InteroperabilityIFDPointer",
      0x0102 : "BitsPerSample",
      0x0103 : "Compression",
      0x0106 : "PhotometricInterpretation",
      0x0112 : "Orientation",
      0x0115 : "SamplesPerPixel",
      0x011C : "PlanarConfiguration",
      0x0212 : "YCbCrSubSampling",
      0x0213 : "YCbCrPositioning",
      0x011A : "XResolution",
      0x011B : "YResolution",
      0x0128 : "ResolutionUnit",
      0x0111 : "StripOffsets",
      0x0116 : "RowsPerStrip",
      0x0117 : "StripByteCounts",
      0x0201 : "JPEGInterchangeFormat",
      0x0202 : "JPEGInterchangeFormatLength",
      0x012D : "TransferFunction",
      0x013E : "WhitePoint",
      0x013F : "PrimaryChromaticities",
      0x0211 : "YCbCrCoefficients",
      0x0214 : "ReferenceBlackWhite",
      0x0132 : "DateTime",
      0x010E : "ImageDescription",
      0x010F : "Make",
      0x0110 : "Model",
      0x0131 : "Software",
      0x013B : "Artist",
      0x8298 : "Copyright"
  };

  var GPSTags = this.GPSTags = {
      0x0000 : "GPSVersionID",
      0x0001 : "GPSLatitudeRef",
      0x0002 : "GPSLatitude",
      0x0003 : "GPSLongitudeRef",
      0x0004 : "GPSLongitude",
      0x0005 : "GPSAltitudeRef",
      0x0006 : "GPSAltitude",
      0x0007 : "GPSTimeStamp",
      0x0008 : "GPSSatellites",
      0x0009 : "GPSStatus",
      0x000A : "GPSMeasureMode",
      0x000B : "GPSDOP",
      0x000C : "GPSSpeedRef",
      0x000D : "GPSSpeed",
      0x000E : "GPSTrackRef",
      0x000F : "GPSTrack",
      0x0010 : "GPSImgDirectionRef",
      0x0011 : "GPSImgDirection",
      0x0012 : "GPSMapDatum",
      0x0013 : "GPSDestLatitudeRef",
      0x0014 : "GPSDestLatitude",
      0x0015 : "GPSDestLongitudeRef",
      0x0016 : "GPSDestLongitude",
      0x0017 : "GPSDestBearingRef",
      0x0018 : "GPSDestBearing",
      0x0019 : "GPSDestDistanceRef",
      0x001A : "GPSDestDistance",
      0x001B : "GPSProcessingMethod",
      0x001C : "GPSAreaInformation",
      0x001D : "GPSDateStamp",
      0x001E : "GPSDifferential"
  };

  var StringValues = this.StringValues = {
      ExposureProgram : {
          0 : "Not defined",
          1 : "Manual",
          2 : "Normal program",
          3 : "Aperture priority",
          4 : "Shutter priority",
          5 : "Creative program",
          6 : "Action program",
          7 : "Portrait mode",
          8 : "Landscape mode"
      },
      MeteringMode : {
          0 : "Unknown",
          1 : "Average",
          2 : "CenterWeightedAverage",
          3 : "Spot",
          4 : "MultiSpot",
          5 : "Pattern",
          6 : "Partial",
          255 : "Other"
      },
      LightSource : {
          0 : "Unknown",
          1 : "Daylight",
          2 : "Fluorescent",
          3 : "Tungsten (incandescent light)",
          4 : "Flash",
          9 : "Fine weather",
          10 : "Cloudy weather",
          11 : "Shade",
          12 : "Daylight fluorescent (D 5700 - 7100K)",
          13 : "Day white fluorescent (N 4600 - 5400K)",
          14 : "Cool white fluorescent (W 3900 - 4500K)",
          15 : "White fluorescent (WW 3200 - 3700K)",
          17 : "Standard light A",
          18 : "Standard light B",
          19 : "Standard light C",
          20 : "D55",
          21 : "D65",
          22 : "D75",
          23 : "D50",
          24 : "ISO studio tungsten",
          255 : "Other"
      },
      Flash : {
          0x0000 : "Flash did not fire",
          0x0001 : "Flash fired",
          0x0005 : "Strobe return light not detected",
          0x0007 : "Strobe return light detected",
          0x0009 : "Flash fired, compulsory flash mode",
          0x000D : "Flash fired, compulsory flash mode, return light not detected",
          0x000F : "Flash fired, compulsory flash mode, return light detected",
          0x0010 : "Flash did not fire, compulsory flash mode",
          0x0018 : "Flash did not fire, auto mode",
          0x0019 : "Flash fired, auto mode",
          0x001D : "Flash fired, auto mode, return light not detected",
          0x001F : "Flash fired, auto mode, return light detected",
          0x0020 : "No flash function",
          0x0041 : "Flash fired, red-eye reduction mode",
          0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
          0x0047 : "Flash fired, red-eye reduction mode, return light detected",
          0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
          0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
          0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
          0x0059 : "Flash fired, auto mode, red-eye reduction mode",
          0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
          0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
      },
      SensingMethod : {
          1 : "Not defined",
          2 : "One-chip color area sensor",
          3 : "Two-chip color area sensor",
          4 : "Three-chip color area sensor",
          5 : "Color sequential area sensor",
          7 : "Trilinear sensor",
          8 : "Color sequential linear sensor"
      },
      SceneCaptureType : {
          0 : "Standard",
          1 : "Landscape",
          2 : "Portrait",
          3 : "Night scene"
      },
      SceneType : {
          1 : "Directly photographed"
      },
      CustomRendered : {
          0 : "Normal process",
          1 : "Custom process"
      },
      WhiteBalance : {
          0 : "Auto white balance",
          1 : "Manual white balance"
      },
      GainControl : {
          0 : "None",
          1 : "Low gain up",
          2 : "High gain up",
          3 : "Low gain down",
          4 : "High gain down"
      },
      Contrast : {
          0 : "Normal",
          1 : "Soft",
          2 : "Hard"
      },
      Saturation : {
          0 : "Normal",
          1 : "Low saturation",
          2 : "High saturation"
      },
      Sharpness : {
          0 : "Normal",
          1 : "Soft",
          2 : "Hard"
      },
      SubjectDistanceRange : {
          0 : "Unknown",
          1 : "Macro",
          2 : "Close view",
          3 : "Distant view"
      },
      FileSource : {
          3 : "DSC"
      },

      Components : {
          0 : "",
          1 : "Y",
          2 : "Cb",
          3 : "Cr",
          4 : "R",
          5 : "G",
          6 : "B"
      }
  };

  function addEvent(element, event, handler) {
      if (element.addEventListener) {
          element.addEventListener(event, handler, false);
      } else if (element.attachEvent) {
          element.attachEvent("on" + event, handler);
      }
  }

  function imageHasData(img) {
      return !!(img.exifdata);
  }

  function base64ToArrayBuffer(base64, contentType) {
      contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
      base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
      var binary = atob(base64);
      var len = binary.length;
      var buffer = new ArrayBuffer(len);
      var view = new Uint8Array(buffer);
      for (var i = 0; i < len; i++) {
          view[i] = binary.charCodeAt(i);
      }
      return buffer;
  }

  function objectURLToBlob(url, callback) {
      var http = new XMLHttpRequest();
      http.open("GET", url, true);
      http.responseType = "blob";
      http.onload = function(e) {
          if (this.status == 200 || this.status === 0) {
              callback(this.response);
          }
      };
      http.send();
  }

  function getImageData(img, callback) {
      function handleBinaryFile(binFile) {
          var data = findEXIFinJPEG(binFile);
          var iptcdata = findIPTCinJPEG(binFile);
          img.exifdata = data || {};
          img.iptcdata = iptcdata || {};
          if (callback) {
              callback.call(img);
          }
      }

      if (img.src) {
          if (/^data\:/i.test(img.src)) { // Data URI
              var arrayBuffer = base64ToArrayBuffer(img.src);
              handleBinaryFile(arrayBuffer);

          } else if (/^blob\:/i.test(img.src)) { // Object URL
              var fileReader = new FileReader();
              fileReader.onload = function(e) {
                  handleBinaryFile(e.target.result);
              };
              objectURLToBlob(img.src, function (blob) {
                  fileReader.readAsArrayBuffer(blob);
              });
          } else {
              $http ({ url: img.src, method:"GET", responseType: "arraybuffer" })
              .then(function (response) {
                handleBinaryFile(response.data);
              },function () {
                throw "Could not load image";
              });
          }
      } else if (window.FileReader && (img instanceof window.Blob || img instanceof window.File)) {
          var fileReader = new FileReader();
          fileReader.onload = function(e) {
              if (debug) console.log("Got file of length " + e.target.result.byteLength);
              handleBinaryFile(e.target.result);
          };

          fileReader.readAsArrayBuffer(img);
      }
  }

  function findEXIFinJPEG(file) {
      var dataView = new DataView(file);

      if (debug) console.log("Got file of length " + file.byteLength);
      if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
          if (debug) console.log("Not a valid JPEG");
          return false; // not a valid jpeg
      }

      var offset = 2,
          length = file.byteLength,
          marker;

      while (offset < length) {
          if (dataView.getUint8(offset) != 0xFF) {
              if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
              return false; // not a valid marker, something is wrong
          }

          marker = dataView.getUint8(offset + 1);
          if (debug) console.log(marker);

          // we could implement handling for other markers here,
          // but we're only looking for 0xFFE1 for EXIF data

          if (marker == 225) {
              if (debug) console.log("Found 0xFFE1 marker");

              return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

              // offset += 2 + file.getShortAt(offset+2, true);

          } else {
              offset += 2 + dataView.getUint16(offset+2);
          }

      }

  }

  function findIPTCinJPEG(file) {
      var dataView = new DataView(file);

      if (debug) console.log("Got file of length " + file.byteLength);
      if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
          if (debug) console.log("Not a valid JPEG");
          return false; // not a valid jpeg
      }

      var offset = 2,
          length = file.byteLength;

      var isFieldSegmentStart = function(dataView, offset){
          return (
              dataView.getUint8(offset) === 0x38 &&
              dataView.getUint8(offset+1) === 0x42 &&
              dataView.getUint8(offset+2) === 0x49 &&
              dataView.getUint8(offset+3) === 0x4D &&
              dataView.getUint8(offset+4) === 0x04 &&
              dataView.getUint8(offset+5) === 0x04
          );
      };

      while (offset < length) {

          if ( isFieldSegmentStart(dataView, offset )){

              // Get the length of the name header (which is padded to an even number of bytes)
              var nameHeaderLength = dataView.getUint8(offset+7);
              if(nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
              // Check for pre photoshop 6 format
              if(nameHeaderLength === 0) {
                  // Always 4
                  nameHeaderLength = 4;
              }

              var startOffset = offset + 8 + nameHeaderLength;
              var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

              return readIPTCData(file, startOffset, sectionLength);

              break;

          }

          // Not the marker, continue searching
          offset++;

      }

  }
  var IptcFieldMap = {
      0x78 : 'caption',
      0x6E : 'credit',
      0x19 : 'keywords',
      0x37 : 'dateCreated',
      0x50 : 'byline',
      0x55 : 'bylineTitle',
      0x7A : 'captionWriter',
      0x69 : 'headline',
      0x74 : 'copyright',
      0x0F : 'category'
  };
  function readIPTCData(file, startOffset, sectionLength){
      var dataView = new DataView(file);
      var data = {};
      var fieldValue, fieldName, dataSize, segmentType, segmentSize;
      var segmentStartPos = startOffset;
      while(segmentStartPos < startOffset+sectionLength) {
          if(dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos+1) === 0x02){
              segmentType = dataView.getUint8(segmentStartPos+2);
              if(segmentType in IptcFieldMap) {
                  dataSize = dataView.getInt16(segmentStartPos+3);
                  segmentSize = dataSize + 5;
                  fieldName = IptcFieldMap[segmentType];
                  fieldValue = getStringFromDB(dataView, segmentStartPos+5, dataSize);
                  // Check if we already stored a value with this name
                  if(data.hasOwnProperty(fieldName)) {
                      // Value already stored with this name, create multivalue field
                      if(data[fieldName] instanceof Array) {
                          data[fieldName].push(fieldValue);
                      }
                      else {
                          data[fieldName] = [data[fieldName], fieldValue];
                      }
                  }
                  else {
                      data[fieldName] = fieldValue;
                  }
              }

          }
          segmentStartPos++;
      }
      return data;
  }

  function readTags(file, tiffStart, dirStart, strings, bigEnd) {
      var entries = file.getUint16(dirStart, !bigEnd),
          tags = {},
          entryOffset, tag,
          i;

      for (i=0;i<entries;i++) {
          entryOffset = dirStart + i*12 + 2;
          tag = strings[file.getUint16(entryOffset, !bigEnd)];
          if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
          tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
      }
      return tags;
  }

  function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
      var type = file.getUint16(entryOffset+2, !bigEnd),
          numValues = file.getUint32(entryOffset+4, !bigEnd),
          valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
          offset,
          vals, val, n,
          numerator, denominator;

      switch (type) {
          case 1: // byte, 8-bit unsigned int
          case 7: // undefined, 8-bit byte, value depending on field
              if (numValues == 1) {
                  return file.getUint8(entryOffset + 8, !bigEnd);
              } else {
                  offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                  vals = [];
                  for (n=0;n<numValues;n++) {
                      vals[n] = file.getUint8(offset + n);
                  }
                  return vals;
              }

          case 2: // ascii, 8-bit byte
              offset = numValues > 4 ? valueOffset : (entryOffset + 8);
              return getStringFromDB(file, offset, numValues-1);

          case 3: // short, 16 bit int
              if (numValues == 1) {
                  return file.getUint16(entryOffset + 8, !bigEnd);
              } else {
                  offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                  vals = [];
                  for (n=0;n<numValues;n++) {
                      vals[n] = file.getUint16(offset + 2*n, !bigEnd);
                  }
                  return vals;
              }

          case 4: // long, 32 bit int
              if (numValues == 1) {
                  return file.getUint32(entryOffset + 8, !bigEnd);
              } else {
                  vals = [];
                  for (n=0;n<numValues;n++) {
                      vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
                  }
                  return vals;
              }

          case 5:    // rational = two long values, first is numerator, second is denominator
              if (numValues == 1) {
                  numerator = file.getUint32(valueOffset, !bigEnd);
                  denominator = file.getUint32(valueOffset+4, !bigEnd);
                  val = new Number(numerator / denominator);
                  val.numerator = numerator;
                  val.denominator = denominator;
                  return val;
              } else {
                  vals = [];
                  for (n=0;n<numValues;n++) {
                      numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
                      denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
                      vals[n] = new Number(numerator / denominator);
                      vals[n].numerator = numerator;
                      vals[n].denominator = denominator;
                  }
                  return vals;
              }

          case 9: // slong, 32 bit signed int
              if (numValues == 1) {
                  return file.getInt32(entryOffset + 8, !bigEnd);
              } else {
                  vals = [];
                  for (n=0;n<numValues;n++) {
                      vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
                  }
                  return vals;
              }

          case 10: // signed rational, two slongs, first is numerator, second is denominator
              if (numValues == 1) {
                  return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
              } else {
                  vals = [];
                  for (n=0;n<numValues;n++) {
                      vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
                  }
                  return vals;
              }
      }
  }

  function getStringFromDB(buffer, start, length) {
      var outstr = "";
      for (var n = start; n < start+length; n++) {
          outstr += String.fromCharCode(buffer.getUint8(n));
      }
      return outstr;
  }

  function readEXIFData(file, start) {
      if (getStringFromDB(file, start, 4) != "Exif") {
          if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
          return false;
      }

      var bigEnd,
          tags, tag,
          exifData, gpsData,
          tiffOffset = start + 6;

      // test for TIFF validity and endianness
      if (file.getUint16(tiffOffset) == 0x4949) {
          bigEnd = false;
      } else if (file.getUint16(tiffOffset) == 0x4D4D) {
          bigEnd = true;
      } else {
          if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
          return false;
      }

      if (file.getUint16(tiffOffset+2, !bigEnd) != 0x002A) {
          if (debug) console.log("Not valid TIFF data! (no 0x002A)");
          return false;
      }

      var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

      if (firstIFDOffset < 0x00000008) {
          if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset+4, !bigEnd));
          return false;
      }

      tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

      if (tags.ExifIFDPointer) {
          exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
          for (tag in exifData) {
              switch (tag) {
                  case "LightSource" :
                  case "Flash" :
                  case "MeteringMode" :
                  case "ExposureProgram" :
                  case "SensingMethod" :
                  case "SceneCaptureType" :
                  case "SceneType" :
                  case "CustomRendered" :
                  case "WhiteBalance" :
                  case "GainControl" :
                  case "Contrast" :
                  case "Saturation" :
                  case "Sharpness" :
                  case "SubjectDistanceRange" :
                  case "FileSource" :
                      exifData[tag] = StringValues[tag][exifData[tag]];
                      break;

                  case "ExifVersion" :
                  case "FlashpixVersion" :
                      exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                      break;

                  case "ComponentsConfiguration" :
                      exifData[tag] =
                          StringValues.Components[exifData[tag][0]] +
                          StringValues.Components[exifData[tag][1]] +
                          StringValues.Components[exifData[tag][2]] +
                          StringValues.Components[exifData[tag][3]];
                      break;
              }
              tags[tag] = exifData[tag];
          }
      }

      if (tags.GPSInfoIFDPointer) {
          gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
          for (tag in gpsData) {
              switch (tag) {
                  case "GPSVersionID" :
                      gpsData[tag] = gpsData[tag][0] +
                          "." + gpsData[tag][1] +
                          "." + gpsData[tag][2] +
                          "." + gpsData[tag][3];
                      break;
              }
              tags[tag] = gpsData[tag];
          }
      }

      return tags;
  }

  this.getData = function(img, callback) {
      if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete) return false;

      if (!imageHasData(img)) {
          getImageData(img, callback);
      } else {
          if (callback) {
              callback.call(img);
          }
      }
      return true;
  }

  this.getTag = function(img, tag) {
      if (!imageHasData(img)) return;
      return img.exifdata[tag];
  }

  this.getAllTags = function(img) {
      if (!imageHasData(img)) return {};
      var a,
          data = img.exifdata,
          tags = {};
      for (a in data) {
          if (data.hasOwnProperty(a)) {
              tags[a] = data[a];
          }
      }
      return tags;
  }

  this.pretty = function(img) {
      if (!imageHasData(img)) return "";
      var a,
          data = img.exifdata,
          strPretty = "";
      for (a in data) {
          if (data.hasOwnProperty(a)) {
              if (typeof data[a] == "object") {
                  if (data[a] instanceof Number) {
                      strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                  } else {
                      strPretty += a + " : [" + data[a].length + " values]\r\n";
                  }
              } else {
                  strPretty += a + " : " + data[a] + "\r\n";
              }
          }
      }
      return strPretty;
  }

  this.readFromBinaryFile = function(file) {
      return findEXIFinJPEG(file);
  }
}]);


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


crop.factory('cropPubSub', [function() {
  return function() {
    var events = {};
    // Subscribe
    this.on = function(names, handler) {
      names.split(' ').forEach(function(name) {
        if (!events[name]) {
          events[name] = [];
        }
        events[name].push(handler);
      });
      return this;
    };
    // Publish
    this.trigger = function(name, args) {
      angular.forEach(events[name], function(handler) {
        handler.call(null, args);
      });
      return this;
    };
  };
}]);

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

}());