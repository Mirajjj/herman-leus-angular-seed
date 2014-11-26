/*global angular, $, paper, setInterval*/
(function () {
    'use strict';

    /* Directives */
    var directives = angular.module('mainModule.directives', []),
        isMouseOver = false;

    directives.directive('canvasHomepage', ['homepageCanvas', function (Initialization) {
        return function (scope, elm, attrs) {
            var init;

            $(elm[0]).width($(window).width());

            init = new Initialization(elm[0]);
        };
    }]);

    directives.directive('sideMenu', [function () {
        return function (scope, elm, attrs) {
            var period = 300;

            $(elm).mouseenter(function () {
                $(this).addClass('shown show').removeClass('collapsed hide');
                isMouseOver = true;
            });

            $(elm).mouseleave(function () {
                var self = $(this);
                isMouseOver = false;

                setTimeout(function () {
                    if (!isMouseOver) {
                        self.addClass('collapsed hide').removeClass('shown show');
                    }
                }, period);
            });
        };
    }]);

    directives.directive('menuImgSlide', [function () {
        return function (scope, elm, attrs) {
            var img = $('.menu-images .' + ($(elm).find('a').data('img-class'))),
                hidden = img.data('hidden-position'),
                visible = img.data('visible-position'),
                period = 500;

            $(elm).hover(
                function () {
                    img.stop().animate({
                        'margin-right': visible,
                        'opacity': 1
                    }, 500);
                },
                function () {
                    img.stop().animate({
                        'margin-right': hidden,
                        'opacity': 0
                    }, 300);

                }
            );
        };
    }]);

    directives.directive('hoverBrain', [function () {
        return function (scope, elm, attrs) {
            $(elm).hover(
                function () {
                    $('#homepage-canvas').trigger('brainMouseOver');
                },
                function () {
                    $('#homepage-canvas').trigger('brainMouseOut');
                }
            );
        };
    }]);

    directives.directive('introductionContainer', [function () {
        return function (scope, elm, attrs) {
            $(elm).animate({
                'top': ($(window).height() * 0.55) + 'px',
                'opacity': 1
            }, 500);
        };
    }]);
})();
