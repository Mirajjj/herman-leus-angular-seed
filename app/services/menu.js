/*global angular, $, paper, window*/
(function () {
    'use strict';

    /* Services */
    var services = angular.module('mainModule.services');

    services.factory('triangleMenu', [function () {
        var Menu = function (canvas) {
            var self = this,
                internal = {};

          /*  self.init = function () {
                var connector = new paper.Path(),
                    offset = 100,
                    points = [],
                    i,
                    circle,
                    color = internal.Color(34, 49, 63, 1);

                connector.strokeColor =  color;
                connector.strokeWidth =  5;

                points.push(new paper.Point(paper.view.size.width - offset, offset));
                points.push(new paper.Point(paper.view.size.width - offset, paper.view.size.height / 2));
                points.push(new paper.Point(paper.view.size.width - offset, paper.view.size.height - offset));

                for (i = 0; i !== points.length; i++) {
                    connector.add(points[i]);
                    circle = new paper.Path.Circle(points[i], 50);
                    circle.fillColor = color;

                }

                connector.closed = true;
            };

            internal.Color = function (red, green, blue, alpha) {
                var _red = red / 255,
                    _green = green / 255,
                    _blue = blue / 255;
                console.log(_red, _green, _blue);
                return new paper.Color(_red, _green, _blue, alpha);
            }

            self.init();*/
        };

        return Menu;
    }]);
})();
