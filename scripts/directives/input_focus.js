(function(){
    'use strict';
    var app = angular.module('BeatBucket');
        
    app.directive('inputFocus', ['$timeout', function($timeout) {
        return {
          scope: { inputFocus: '=' },
          link: function(scope, element) {

            scope.$watch('inputFocus', function(newValue) {
                if(newValue === true) {
                    $timeout(function(){
                        element[0].focus();
                    }, 100);                    
                }
            });
          }
        };
      }]);
})();