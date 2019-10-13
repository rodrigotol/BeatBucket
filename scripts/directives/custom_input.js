(function(){
    'use strict';

    var app = angular.module('BeatBucket');

    app.directive('customInput', function () {
        return {
            restrict: 'E',            
            replace: true,
            scope: {                
                onEsc: '=',
                onEnter: '='
            },
            templateUrl: 'scripts/directives/templates/custom_input.html',
            link: function (scope, element, attrs) {
                scope.placeholder = attrs.placeholder;
                scope.setFocus = true;
                scope.value = null;

                element.bind('keydown keypress', function (event) {
                    if(event.which === 27) { // 27 = esc key
                        if(scope.onEsc) {
                            scope.onEsc();
                        }                    
            
                        event.preventDefault();
                    } else if(event.which === 13) { // 13 = enter
                        if(attrs.onEnter && scope.value !== null) {
                            scope.onEnter(scope.value);
                        } else {
                            scope.onEsc();
                        }

                        event.preventDefault();
                    }
                });

                scope.EscOrEnter = function() {
                    if(attrs.onEnter && scope.value !== null) {
                        scope.onEnter(scope.value);
                    } else if(scope.onEsc) {
                        scope.onEsc();
                    }
                }

                scope.$on('$destroy', function() {
                    element.unbind('keydown keypress')
                })
            }
        }
      })
})();