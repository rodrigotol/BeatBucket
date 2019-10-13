(function () {
  'use strict';
  var app = angular.module('BeatBucket');

  const electron = require('electron');

  app.directive('dragWindow', [function () {
    return {
      restrict: 'A',
      scope: {},
      link: function (scope, element) {
        scope.windowInfo = {
          dragging: false,
          x: 0,
          y: 0
        };

        element.on('mousedown', function (e) {
          scope.windowInfo.dragging = true;
          scope.windowInfo.x = e.pageX;
          scope.windowInfo.y = e.pageY;
        });

        window.onmousemove = function (e) {
          if (scope.windowInfo.dragging) {
            electron.remote.getCurrentWindow().setPosition(e.screenX - scope.windowInfo.x, e.screenY - scope.windowInfo.y);
          }
        }

        window.onmouseup = function () {
          scope.windowInfo.dragging = false;
        }
      }
    };
  }]);
})();    