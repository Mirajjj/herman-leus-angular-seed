/*global angular, $, paper, setInterval*/
(function () {
    'use strict';

    /* Directives */
    var directives = angular.module('mainModule.directives', []);

    directives.directive('canvasHomepage', ['brainFactory', function (Brain) {
        return function (scope, elm, attrs) {
            var brain = new Brain(elm[0]);
        };
    }]);
})();
