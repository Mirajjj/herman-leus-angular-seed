/*global angular, $, paper*/
(function () {
    'use strict';

    /* Services */
    var services = angular.module('mainModule.services', []);

    services.factory('brainFactory', function () {
        var Brain = function (items) {
            var self = this,
                _loadedItems = items,
                _mainCenterItem,
                createItem,
                moveItemByPath,
                generatePath,
                getRandomInt,
                groupWithBackground,
                getBlinkingEventFunc,
                draw2LevelAnimation;

            self.getItems = function () {
                return _loadedItems;
            };

            self.init = function () {
                _mainCenterItem = new paper.Group([paper.project.importSVG(_loadedItems[0]), paper.project.importSVG(_loadedItems[1])]);
                _mainCenterItem.name = 'loaderCenterItem';
                _mainCenterItem.scale(0.2);
                _mainCenterItem.position.x = paper.view.size.width / 2 - (_mainCenterItem.bounds.width / 2) * 0.2;
                _mainCenterItem.position.y = paper.view.size.height / 2 - (_mainCenterItem.bounds.height / 2) * 0.2;
                _mainCenterItem.children[0].fillColor = '#fff';

                //draw2LevelAnimation();
            };

            self.getUpdateFunctions = function () {
                var timeElapsed = 0,
                    centerItemEnLarge = true,
                    centerItemMinSize = {
                        width: _mainCenterItem.bounds.width,
                        height: _mainCenterItem.bounds.height,
                        x: _mainCenterItem.bounds.x,
                        y: _mainCenterItem.bounds.y
                    },
                    flyingItemFunc = [];


                return {
                    'center': function (event, period, speed) {
                        var _speed = speed || 1,
                            _period = period || 2,
                            _speedUp = 4,
                            scalingStepLarger = 1.001 + (0.001 * _speed),
                            scalingStepSmaller = 0.999 - (0.001 * _speed),
                            bouncingEffect =  true,
                            flyingItem,
                            i;

                        if (timeElapsed > _period) {
                            timeElapsed = 0;

                            if (centerItemEnLarge) {
                                flyingItem = createItem(2);
                                flyingItemFunc.push(moveItemByPath(generatePath(), flyingItem));
                            }

                            centerItemEnLarge = centerItemEnLarge ? false : true;
                        }

                        if (centerItemEnLarge) {
                            if (bouncingEffect && timeElapsed > _period * 0.9) {
                                _mainCenterItem.scale(scalingStepLarger + (0.001 * _speed * _speedUp));

                            } else {
                                _mainCenterItem.scale(scalingStepLarger);
                            }
                        } else {
                            if (bouncingEffect && timeElapsed < _period * 0.1) {
                                _mainCenterItem.scale(scalingStepSmaller - (0.001 * _speed * _speedUp));
                            } else {
                                _mainCenterItem.scale(scalingStepSmaller);
                            }

                            if (_mainCenterItem.bounds.width < centerItemMinSize.width) {
                                _mainCenterItem.bounds.width  = centerItemMinSize.width;
                                _mainCenterItem.bounds.height = centerItemMinSize.height;
                                _mainCenterItem.bounds.x = centerItemMinSize.x;
                                _mainCenterItem.bounds.y = centerItemMinSize.y;
                            }
                        }

                        timeElapsed += event.delta;

                        if (flyingItemFunc.length > 0) {
                            for (i = 0; i < flyingItemFunc.length; i++) {
                                if (flyingItemFunc[i]) {
                                    flyingItemFunc[i](event);
                                } else {
                                    flyingItemFunc.splice(i, 1);
                                    // console.log(flyingItemFunc);
                                }
                            }
                        }
                    }
                };
            };

            createItem = function (index) {
                var createdItem = paper.project.importSVG(_loadedItems[index]),
                    group = groupWithBackground(createdItem);

                _mainCenterItem.insertAbove(group);
                group.scale(0.3);
                group.position.x = paper.view.size.width / 2 - (createdItem.bounds.width / 2) * 0.3;
                group.position.y = paper.view.size.height / 2 - (createdItem.bounds.height / 2) * 0.3;

                return group;
            };

            moveItemByPath = function (path, item) {
                var target = path.first,
                    steps = getRandomInt(300, 400),
                    dX = 0,
                    dY = 0,
                    randomRotateValue = getRandomInt(0, 1) ? getRandomInt(3, 5) : getRandomInt(-5, -3),
                    tempPosition,
                    blinking = getBlinkingEventFunc(item.children[0]);

                item.position.x = target[0];
                item.position.y = target[1];
                tempPosition = {
                    x: item.position.x,
                    y: item.position.y
                };

                //When rotating positioning of element is slightly different from expected so I am creating tracks that are
                //not visible however they are insurance that item reaches specific point

                return function (event) {
                    /* console.log('x ' + item.position.x + ' ' + target[0]);
                     console.log('y ' + item.position.y + ' ' + target[1]);
                     console.log(eventCounter);*/

                    if (parseFloat(tempPosition.x.toFixed(2)) === target[0] && parseFloat(tempPosition.y.toFixed(2)) === target[1]) {
                        switch (target) {
                            case path.first:
                                target = path.last;
                                break;
                            case path.last:
                                // console.log('removed');
                                item.remove();
                                path.path.remove();
                                this[0] = null;
                                return;
                        }
                        // calculate the dX and dY
                        dX = (target[0] - item.position.x) / steps;
                        dY = (target[1] - item.position.y) / steps;
                        //console.log(target[0] + " " + item.position.x);
                    }

                    // do the movement
                    item.rotate(randomRotateValue);
                    item.position.x += dX;
                    item.position.y += dY;
                    tempPosition.x += dX;
                    tempPosition.y += dY;

                    if (blinking && blinking(event)) { // Stop invocation of this function as it has no need anymore
                        blinking = false;
                    }
                    // console.log(target[0] + " " + item.position.x);
                };
            };

            generatePath = function () {
                var point1 = [paper.view.size.width / 2, paper.view.size.height / 2],
                    point2,// = [paper.view.size.width, paper.view.size.height],
                    path = new paper.Path();

                if (getRandomInt(0, 1) === 1) {
                    point2 = [paper.view.size.width * 1.1, getRandomInt(0, paper.view.size.height)];
                } else {
                    point2 = [getRandomInt(0, paper.view.size.width), paper.view.size.height * 1.1];
                }

                path.add(new paper.Point(point1), new paper.Point(point2));
                //path.strokeColor = 'black';
                path.closed = true;

                return {
                    first: point1,
                    last: point2,
                    path: path
                };
            };

            getRandomInt = function (min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            };

            groupWithBackground = function (item) {
                var group,
                    path = new paper.Path.Circle({
                        center: [item.position.x, item.position.y],
                        radius: item.bounds.width > item.bounds.height ? item.bounds.width : item.bounds.height
                    }),
                    position = new paper.Point(path.position);

                position.y -= path.bounds.width / 10;

                path.fillColor = {
                    gradient: {
                        stops: [['#ffff00', 0.05], [new paper.Color(1, 1, 0, 0), 0.9 ]],
                        radial: true
                    },
                    origin: position,
                    destination: path.bounds.topCenter
                };

                group = new paper.Group(path, item);

                return group;
            };

            getBlinkingEventFunc = function (item) {
                var delta = 0,
                    timePassed = 0,
                    timeLimit = 1.5;

                item.visible = false;

                return function (event) {
                    delta += event.delta;
                    timePassed += event.delta;

                    if (timePassed > timeLimit && delta > 0.05) {
                        delta = 0;

                        item.visible = item.visible ? false : true;
                    }

                    if (timePassed > timeLimit + 1) {
                        item.visible = true;

                        return true; // Means that you can remove invocation of this function
                    }

                    return false;// Means that you ought not to remove invocation of this function
                };
            };

            draw2LevelAnimation = function () {
                var path = new paper.Path();
                path.strokeColor = 'black';
                path.add(new paper.Point(paper.view.size.width / 2  - _mainCenterItem.bounds.width, paper.view.size.height / 2));
                path.add(new paper.Point(paper.view.size.width / 2  + _mainCenterItem.bounds.width, paper.view.size.height / 2));
            };
        };

        return Brain;
    });
})();

