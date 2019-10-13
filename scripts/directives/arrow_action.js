(function () {
    'use strict';
    var app = angular.module('BeatBucket');    
  
    app.directive('arrowAction', [function () {
        return {
            restrict: 'A',
            scope: {
                arrowAction: '=',
                arrowLeft: '=',
                arrowUp: '=',
                arrowRight: '=',
                arrowDown: '='              
            },
            link: function (scope) {
                document.body.onkeydown = function(e){    
                    if (!scope.arrowAction) return true;

                    if (e.keyCode == 37 && scope.arrowLeft !== undefined) {
                        e.preventDefault();
                        scope.arrowLeft();   
                    } else if (e.keyCode == 38 && scope.arrowUp !== undefined) {
                        e.preventDefault();
                        scope.arrowUp();  
                    } else if (e.keyCode == 39 && scope.arrowRight !== undefined) {
                        e.preventDefault();
                        scope.arrowRight();
                    } else if (e.keyCode == 40 && scope.arrowDown !== undefined) {
                        e.preventDefault();
                        scope.arrowDown();        
                    }
                };                
            }
        };
    }]);
  })();