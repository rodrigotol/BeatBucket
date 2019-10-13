(function () {
    'use strict';

    var app = angular.module('BeatBucket');

    app.directive('contextMenu', ['contextMenuService', 
    function (contextMenuService) {
        return {
            restrict: 'A',
            scope: {
                contextMenuBind: '=',
                contextMenuTarget: '='
            },
            link: function (scope, element, attrs) {
                scope.menu = document.querySelector('#' + attrs.contextMenu);
                scope.isVisible = false;
                scope.my_element = element;
                scope.contextMenuService = contextMenuService;
                scope.targetMenu = attrs.contextMenu;                                              

                scope.my_element[0].addEventListener('contextmenu', function (event) {                    
                    if (event.target != scope.my_element[0]) return false;

                    var data = {                        
                        left: event.clientX,
                        top: event.clientY                                         
                    };
                    
                    if (scope.contextMenuBind !== undefined && scope.contextMenuTarget !== undefined) {
                        scope.contextMenuBind = scope.contextMenuTarget;

                        if(!scope.$$phase) {
                            scope.$apply();
                        }
                    }                        

                    toggleMenu('show', data);
                    scope.contextMenuService.openContextMenu(scope.targetMenu, hideMenu);

                    return false;
                });

                window.addEventListener("click", e => {
                    if (scope.isVisible)
                        toggleMenu("hide");
                });

                function hideMenu() {
                    scope.menu.style.display = "none";
                    scope.isVisible = false;
                }

                function toggleMenu(command, event = null) {
                    if (command === "show") {
                        scope.menu.style.display = "block";
                        scope.isVisible = true;
                    } else {
                        hideMenu();
                    }


                    if (!event) return;

                    var container = document.getElementsByClassName('context-container')[0];
                    var container_style = window.getComputedStyle(container);

                    var menu_style = window.getComputedStyle(scope.menu);
                    var menu_width = parseInt(menu_style.width.split('px')[0]);
                    var menu_height = parseInt(menu_style.height.split('px')[0]);
                    var container_width = parseInt(container_style.width.split('px')[0]);
                    var container_height = parseInt(container_style.height.split('px')[0]);
                    var pos_x = event.left;
                    var pos_y = event.top;

                    if ((pos_x + menu_width) > container_width) {
                        pos_x = container_width - menu_width;
                    }

                    if ((pos_y + menu_height) > container_height) {
                        pos_y = container_height - menu_height;
                    }

                    setPosition({ pos_x: pos_x, pos_y: pos_y });
                }

                function setPosition(position) {
                    scope.menu.style.left = `${position.pos_x}px`;
                    scope.menu.style.top = `${position.pos_y}px`;
                }
            }
        };
    }]);    
})();