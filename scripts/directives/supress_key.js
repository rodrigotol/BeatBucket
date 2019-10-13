(function(){
    'use strict';  
  
    var app = angular.module('BeatBucket');
  
    app.directive('suppressKey', [function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                scope.keySuppressList = scope.$eval(attrs.suppressKey);
                document.body.onkeydown = function(e){
                    // F11 event
                    if(scope.keySuppressList.includes(e.keyCode)) {
                        e.preventDefault();
                        return;
                    }
                };
            }
        };
    }]);
})();    