/*global angular, $, paper, window*/
(function () {
    'use strict';

    /* Services */
    var services = angular.module('mainModule.services', []);

    services.factory('homepageCanvas', ['brainFactory', 'triangleMenu', function (Brain, Menu) {
        var Initialization  = function (canvas) {
            var brain, menu;

            paper.setup(canvas);

            brain = new Brain(canvas);
            menu = new Menu(canvas);

            paper.view.onFrame = function (event) {
                brain.onFrame(event);
            };
        };

        return Initialization;
    }]); 

})();