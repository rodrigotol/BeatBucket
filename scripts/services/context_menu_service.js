(function() {
    'use strict';
    var app = angular.module('BeatBucket');

    app.service("contextMenuService", function() {        
        var openMenu = null;
        var closeMenuCallback = null;

        this.openContextMenu = function(targetMenu, closeCallback) {
            if (openMenu && openMenu !== targetMenu)
                closeMenuCallback();

            openMenu = targetMenu;
            closeMenuCallback = closeCallback;
        }
    });
})();