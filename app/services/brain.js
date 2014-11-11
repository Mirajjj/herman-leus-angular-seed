/*global angular, $, paper*/
(function () {
    'use strict';

    /* Services */
    var services = angular.module('mainModule.services', []);

    services.factory('brainFactory', ['$q', '$http', '$templateCache', function ($q, $http, $templateCache) {
        var Brain = function (canvas) {
            var self = this,
                _loadedItems = [],
                _mainCenterItem,
                _brainBG,
                _images = [],
                internal =  {};

            paper.setup(canvas);

            self.getItems = function () {
                return _loadedItems;
            };

            self.init = function () {
                var updateFunc,
                    hoverFunc;

                _images[0].visible = true;
                _brainBG = internal.attachCompoundPath(paper.project.importSVG(_loadedItems[0]), _images[0]);
                _mainCenterItem = new paper.Group([paper.project.importSVG(_loadedItems[0]), paper.project.importSVG(_loadedItems[1])]);

                _mainCenterItem.name = 'loaderCenterItem';
                _mainCenterItem.scale(0.4);
                _mainCenterItem.position.x = paper.view.size.width / 2 - (_mainCenterItem.bounds.width / 2) * 0.2;
                _mainCenterItem.position.y = paper.view.size.height / 2 - (_mainCenterItem.bounds.height / 2) * 0.2;
                _mainCenterItem.children[0].visible = false;

                _brainBG.scale(0.39);
                _brainBG.position.x = paper.view.size.width / 2 - (_brainBG.bounds.width / 2) * 0.2;
                _brainBG.position.y = paper.view.size.height / 2 - (_brainBG.bounds.height / 2) * 0.2;

                updateFunc = self.getUpdateFunctions().center;
                hoverFunc =  self.getUpdateFunctions().changeImages;

                paper.view.onFrame = function (event) {
                    updateFunc(event, 1, 3);
                    hoverFunc(event);
                };
            };

            internal.setFiles = function (func) {
                $q.all({
                    svgBrainBackground: $http.get('images/vector/brainBackground.svg'),
                    svgBrain:  $http.get('images/vector/brain.svg'),
                    svgLamp:  $http.get('images/vector/ideaLamp.svg')
                }).then(function (values) {
                    var key;

                    for (key in values) {
                        if (key.indexOf('svg') > -1) {
                            _loadedItems.push(values[key].data);
                        }
                    }

                    internal.setImages();
                    func();
                });
            };

            internal.setImage = function (src) {
                var raster = new paper.Raster({
                    source: src,
                    position: paper.view.center
                });

                raster.visible = false;

                _images.push(raster);

                return raster;
            };

            internal.setImages = function () {
                internal.setImage('images/raster/brainMasks/mask1.jpg');
                internal.setImage('images/raster/brainMasks/mask2.jpg');
                internal.setImage('images/raster/brainMasks/mask3.jpg');
                internal.setImage('images/raster/brainMasks/mask4.jpg');
                internal.setImage('images/raster/brainMasks/mask5.jpg');
            };

            internal.attachCompoundPath = function (path, raster) {
                var compoundPath,
                    group;

                path.position.x = paper.view.size.width / 2 - (path.bounds.width / 2) * 0.2;
                path.position.y = paper.view.size.height / 2 - (path.bounds.height / 2) * 0.2;

                compoundPath = new paper.CompoundPath(path);

                group = new paper.Group([compoundPath, raster]);
                //group.clipMask = true;
                group.clipped = true;

                path.getGroup = function () {
                    return group;
                };

                return path;//_compoundPathGroups.push(group);
            };

            internal.actions = {};
            internal.actions.brain = {};
            internal.actions.brain.currentPlay = 0;
            internal.actions.brain.scenario = [
                function () {
                    //Normal Enlarging
                    _mainCenterItem.scale(internal.actions.brain.config.scaleInc);
                    _brainBG.scale(internal.actions.brain.config.scaleInc);

                    if (_mainCenterItem.bounds.width  >= internal.actions.brain.config.breakPointWidth) {
                        internal.actions.brain.config.timeElapsed  = 0;
                        internal.actions.brain.currentPlay++;
                    }
                },
                function (flyingItemFunc) {
                    //Quick Enlarging
                    _mainCenterItem.scale(internal.actions.brain.config.scaleIncX2);
                    _brainBG.scale(internal.actions.brain.config.scaleIncX2);

                    if (_mainCenterItem.bounds.width  >= internal.actions.brain.config.maxWidth) {
                        internal.actions.brain.config.timeElapsed  = 0;
                        internal.actions.brain.currentPlay++;

                        flyingItemFunc.push(internal.moveItemByPath(internal.generatePath(), internal.createItem(2)));
                    }
                },
                function () {
                    //Quick Size Decrease

                    _mainCenterItem.scale(internal.actions.brain.config.scaleDecX2);
                    _brainBG.scale(internal.actions.brain.config.scaleDecX2);

                    if (_mainCenterItem.bounds.width  <= internal.actions.brain.config.breakPointWidth) {
                        internal.actions.brain.config.timeElapsed  = 0;
                        internal.actions.brain.currentPlay++;
                    }
                },
                function () {
                    //Normal Size Decrease
                    _mainCenterItem.scale(internal.actions.brain.config.scaleDec);
                    _brainBG.scale(internal.actions.brain.config.scaleDec);

                    if (_mainCenterItem.bounds.width  <= internal.actions.brain.config.minWidth) {
                        internal.actions.brain.config.timeElapsed  = 0;
                        internal.actions.brain.currentPlay = 0;
                    }
                },
                function () {

                }
            ];

            self.getUpdateFunctions = function () {
                var flyingItemFunc = [],
                    timeElapsed = 0,
                    imageIndex = 0;

                internal.actions.brain.config = {
                    timeElapsed: 0,
                    scaleInc: 1.005,
                    scaleIncX2: 1.02,
                    scaleDec: 0.995,
                    scaleDecX2: 0.98,
                    minWidth: _mainCenterItem.bounds.width,
                    breakPointWidth: _mainCenterItem.bounds.width * 1.3,
                    maxWidth: _mainCenterItem.bounds.width * 1.5
                };

                return {
                    'center': function (event, period, speed) {
                        var i;

                        internal.actions.brain.scenario[internal.actions.brain.currentPlay](flyingItemFunc);
                        internal.actions.brain.config.timeElapsed  += event.delta;

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
                    },
                    changeImages: function (event) {
                        var i;

                        timeElapsed += event.delta;

                        if (timeElapsed > 0.1) {
                            timeElapsed = 0;

                            if (imageIndex >= _images.length) {
                                imageIndex = 0;
                            }
                            _images[imageIndex].visible = true;
                            _brainBG.getGroup().children[1] = _images[imageIndex];

                            imageIndex++;
                        }
                    }
                };
            };

            internal.createItem = function (index) {
                var createdItem = paper.project.importSVG(_loadedItems[index]),
                    group = internal.groupWithBackground(createdItem);

                group.sendToBack();

                group.scale(0.5);
                group.position.x = paper.view.size.width / 2 - (createdItem.bounds.width / 2) * 0.3;
                group.position.y = paper.view.size.height / 2 - (createdItem.bounds.height / 2) * 0.3;

                return group;
            };

            internal.moveItemByPath = function (path, item) {
                var target = path.first,
                    steps = 200,//internal.getRandomInt(300, 400),
                    dX = 0,
                    dY = 0,
                    randomRotateValue = 2,//internal.getRandomInt(0, 1) ? internal.getRandomInt(3, 5) : internal.getRandomInt(-5, -3),
                    tempPosition,
                    blinking = internal.getBlinkingEventFunc(item.children[0]);

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

            internal.generatePath = function () {
                var point1 = [paper.view.size.width / 2, paper.view.size.height / 2],
                    point2,// = [paper.view.size.width, paper.view.size.height],
                    path = new paper.Path();

                if (internal.getRandomInt(0, 1) === 1) {
                    point2 = [paper.view.size.width * 1.1, internal.getRandomInt(0, paper.view.size.height)];
                } else {
                    point2 = [internal.getRandomInt(0, paper.view.size.width), paper.view.size.height * 1.1];
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

            internal.getRandomInt = function (min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            };

            internal.groupWithBackground = function (item) {
                var group,
                    path = new paper.Path.Circle({
                        center: [item.position.x, item.position.y + 20],
                        radius: (item.bounds.width > item.bounds.height ? item.bounds.width : item.bounds.height) * 1.5
                    }),
                    position = new paper.Point(path.position);

                position.y -= path.bounds.width / 10;

                path.fillColor = {
                    gradient: {
                        stops: [['#ffee34', 0.01], [new paper.Color(255, 216, 81, 0.8), 0.01], [new paper.Color(1, 1, 0, 0.0), 1]],
                        radial: true
                    },
                    origin: position,
                    destination: path.bounds.topCenter
                };

                group = new paper.Group(path, item);

                return group;
            };

            internal.getBlinkingEventFunc = function (item) {
                var delta = 0,
                    timePassed = 0,
                    timeLimit = 1;

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

            internal.draw2LevelAnimation = function () {
                var path = new paper.Path();
                path.strokeColor = 'black';
                path.add(new paper.Point(paper.view.size.width / 2  - _mainCenterItem.bounds.width, paper.view.size.height / 2));
                path.add(new paper.Point(paper.view.size.width / 2  + _mainCenterItem.bounds.width, paper.view.size.height / 2));
            };


            internal.setFiles(self.init);
        };

        return Brain;
    }]);
})();

