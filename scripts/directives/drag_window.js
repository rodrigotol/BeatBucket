(function () {
  'use strict';
  var app = angular.module('BeatBucket');

  const electron = require('electron');

  app.directive('dragWindow', [function () {
    return {
      restrict: 'A',
      scope: {},
      link: function (scope, element) {
        var bounds = electron.remote.getCurrentWindow().getBounds();

        scope.windowInfo = {
          dragging: false,
          width: bounds.width,
          height: bounds.height,
          x: bounds.width,
          y: bounds.height
        };

        element.on('mousedown', function (e) {
          scope.windowInfo.dragging = true;
          scope.windowInfo.x = e.pageX;
          scope.windowInfo.y = e.pageY;
        });

        window.onmousemove = function (e) {
          if (scope.windowInfo.dragging) {            
            electron.remote.getCurrentWindow().setBounds({
              x: e.screenX - scope.windowInfo.x,
              y: e.screenY - scope.windowInfo.y,
              width: scope.windowInfo.width,
              height: scope.windowInfo.height              
            });            
          }
        }

        window.onmouseup = function () {
          scope.windowInfo.dragging = false;
        }
      }
    };
  }]);
})();    