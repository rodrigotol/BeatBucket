(function(){
    'use strict';

    var _templateBase = './scripts'
    angular.module('BeatBucket').config(buildRoutes); 

    buildRoutes.$inject = ['$routeProvider'];
    
    function buildRoutes($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: _templateBase + '/views/beatbucket.html' ,
            controller: 'BeatBucketController',
            controllerAs: 'vm'
        });
        
        $routeProvider.otherwise({ redirectTo: '/' });
    }
})();