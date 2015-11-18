/*global angular, $, paper, setInterval*/
(function () {
    'use strict';

    /* Directives */
    var directives = angular.module('mainModule.directives', []),
        isMouseOver = false;

    directives.directive('jqueryCustomFuncs', function () {
        return function (scope, elm, attrs) {
            $.fn.strech_text = function () {
                var elmt          = $(this),
                    cont_width    = elmt.width(),
                    txt           = elmt.text(),
                    one_line      = $('<span class="stretch_it">' + txt + '</span>'),
                    nb_char       = elmt.text().length,
                    spacing       = cont_width / nb_char,
                    txt_width;

                elmt.html(one_line);
                txt_width = one_line.width();

                if (txt_width < cont_width) {
                    var char_width     = txt_width / nb_char,
                        ltr_spacing    = spacing - char_width + (spacing - char_width) / nb_char;

                    one_line.css({'letter-spacing': ltr_spacing});
                } else {
                    one_line.contents().unwrap();
                    elmt.addClass('justify');
                }
            };
        };
    });

    directives.directive('canvasHomepage', ['homepageCanvas', function (Initialization) {
        return function (scope, elm, attrs) {
            var init,
                resize = function () {
                    $(elm).width($(window).width());
                    $(elm).height($(window).height());
                };

            resize();

            $(window).resize(resize);

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
                        'margin-left': visible,
                        'opacity': 1
                    }, 500);
                },
                function () {
                    img.stop().animate({
                        'margin-left': hidden,
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
            var resize = function () {
                    $(elm).find('h1').strech_text();

                    $(elm).stop().animate({
                        'top': ($(window).height() - 120) + 'px',
                        'opacity': 1
                    });
                };

            resize();
            $(window).resize(resize);
        };
    }]);

    directives.directive('webTitles', [function () {
        return function (scope, elm, attrs) {
            var resize = function () {

                $(elm).stop().animate({
                    'left': '10%',
                    'opacity': 1
                }, {
                    duration: 500
                });
            };

            resize();
            $(window).resize(resize);
        };
    }]);

})();
