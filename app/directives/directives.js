/*global angular, $, paper, setInterval*/
(function () {
    'use strict';

    /* Directives */
    var directives = angular.module('mainModule.directives', []);

    directives.directive('canvasHomepage', ['brainFactory', function (Brain) {
        return function (scope, elm, attrs) {
            var svgItems = [],
                brain;

            paper.setup(elm[0]);

            $.when(
                $.get('images/vector/brainBackground.svg', null, null, 'xml').success(function (svg) {
                    svgItems.push(svg);
                }),
                $.get('images/vector/brain.svg', null, null, 'xml').success(function (svg) {
                    svgItems.push(svg);
                }),
                $.get('images/vector/ideaLamp.svg', null, null, 'xml').success(function (svg) {
                    svgItems.push(svg);
                })
            ).then(function () {
                var updateBrain;

                brain = new Brain(svgItems);
                brain.init();

                updateBrain = brain.getUpdateFunctions()['center'];

                paper.view.onFrame = function (event) {
                    updateBrain(event, 2, 1);
                };
            });
        };
    }]);
})();
