/*global angular, $, paper*/
(function () {
    'use strict';

    /* Services */
    var services = angular.module('mainModule.services', []);

    services.factory('homepageNavigation', function () {
        var Navigation = function (canvas) {
            var self = this,
                _project = paper.project,
                _config = {},
                _internal = {},
                _images = [],
                _compoundPathGroups = [],
                _blocks = [],
                _colorPattern = ['#10112d', '#c6c7c9', '#6bb4ad', '#b1b9bb', '#008e89', '#e0e4e5', '#868b8e'];

            _internal.init = function (canvas) {
                var hexagonOuterRadius = 90,
                    hexagonInnerRadius = (Math.sqrt(3) * hexagonOuterRadius) / 2,
                    margin = 10,
                    variance = 5,
                    delta = {
                        x: hexagonInnerRadius,
                        y: hexagonOuterRadius + hexagonOuterRadius / 2 + margin
                    },
                    defaultPosition,
                    blockCoordinates = [],
                    block;

                paper.setup(canvas);
                _internal.setImages();

                defaultPosition = new paper.Point(paper.view.center.x, hexagonOuterRadius + 30);

                blockCoordinates.push(new paper.Point(defaultPosition.x - delta.x - variance, defaultPosition.y + delta.y));
                blockCoordinates.push(new paper.Point(blockCoordinates[0].x + delta.x * 2 + variance * 2, blockCoordinates[0].y));
                blockCoordinates.push(new paper.Point(blockCoordinates[0].x - delta.x - variance, blockCoordinates[0].y + delta.y));
                blockCoordinates.push(new paper.Point(blockCoordinates[1].x - delta.x - variance, blockCoordinates[1].y + delta.y));
                blockCoordinates.push(new paper.Point(blockCoordinates[3].x + delta.x * 2 + variance * 2, blockCoordinates[3].y));
                blockCoordinates.push(new paper.Point(blockCoordinates[3].x - delta.x - variance, blockCoordinates[3].y + delta.y));
                blockCoordinates.push(new paper.Point(blockCoordinates[3].x, blockCoordinates[5].y + delta.y));
                blockCoordinates.push(new paper.Point(blockCoordinates[4].x, blockCoordinates[5].y + delta.y));

                block = _internal.addBlock(0, defaultPosition, hexagonOuterRadius);
                _internal.addBlockDecoration(0, block);
                _internal.addBlockDecoration(4, block, margin, hexagonOuterRadius);
                _internal.addBlockDecoration(5, block, margin, hexagonOuterRadius);

                _internal.addBlock(1, blockCoordinates[0], hexagonOuterRadius);
                block = _internal.addBlock(2, blockCoordinates[1], hexagonOuterRadius);

                _internal.addBlockDecoration(1, block);
                _internal.addBlock(3, blockCoordinates[2], hexagonOuterRadius);
                _internal.addBlock(4, blockCoordinates[3], hexagonOuterRadius);
                _internal.addBlock(5, blockCoordinates[4], hexagonOuterRadius);

                block = _internal.addBlock(6, blockCoordinates[5], hexagonOuterRadius);
                _internal.addBlockDecoration(2, block);
                _internal.addBlock(7, blockCoordinates[6], hexagonOuterRadius);

                block = _internal.addBlock(8, blockCoordinates[7], hexagonOuterRadius);
                _internal.addBlockDecoration(3, block);

                paper.view.onFrame = function () {
                    _images[0].rotate(1);
                    _images[1].rotate(1);
                    _images[2].rotate(1);
                };

            };

            _internal.setImages = function () {
                _images.push(_internal.setImage('images/raster/homepage/11.jpg'));
                _internal.attachCompoundPath(_images[0]);

                _images.push(_internal.setImage('images/raster/homepage/7.jpg'));
                _internal.attachCompoundPath(_images[1]);

                _images.push(_internal.setImage('images/raster/homepage/8.jpg'));
                _internal.attachCompoundPath(_images[2]);
            };

            _internal.setImage = function (src) {
                var raster = new paper.Raster({
                    source: src,
                    position: paper.view.center
                });

                return raster;
            };

            _internal.attachCompoundPath = function (raster) {
                var compoundPath,
                    group;

                compoundPath = new paper.CompoundPath({
                    children: []
                });

                group = new paper.Group([compoundPath, raster]);
                //group.clipMask = true;
                group.clipped = true;

                _compoundPathGroups.push(group);
            };

            _internal.cropImageByPath = function (imgID, path) {
                var group = _compoundPathGroups[imgID],
                    compoundPath = group.children[0];

                compoundPath.children.push(path);
            };

            _internal.Polygon = function (points, color) {
                var path = new paper.Path(),
                    i; // Points from left to right

                for (i = 0; i !== points.length; i++) {
                    path.add(points[i]);
                }

                path.fillColor =  color || null;
                path.strokeColor = color || null;
                path.strokeWidth = 1;
                path.closed = true;


                return path;
            };

            _internal.Hexagon = function (position, radius, color) {
                var center = position,
                    sides = 6,
                    hexagon = new paper.Path.RegularPolygon(center, sides, radius);
                hexagon.fillColor =  color || null;

                return hexagon;
            };

            _internal.Circle = function (position, radius, color) {
                var circle = new paper.Path.Circle({
                    center:  position,
                    radius: radius,
                    fillColor: color
                });

                return circle;
            };

            _internal.operators = {};

            _internal.operators.addition = function (points) {
                var i,
                    finalPoint = new paper.Point(0, 0);

                for (i = 0; i !== points.length; i++) {
                    finalPoint.x += points[i].x;
                    finalPoint.y += points[i].y;
                }

                return finalPoint;
            };

            _internal.trigonometry = {};

            _internal.trigonometry.getAngle = function (startPoint, endPoint, debug) {
                var distance =  startPoint.getDistance(endPoint),
                    nearSide = Math.abs(startPoint.y - endPoint.y).toFixed(2),
                    radians,
                    degrees,
                    quarter;

                if ((startPoint.x <= endPoint.x) && (startPoint.y <= endPoint.y)) {
                    quarter = 1;
                    degrees = 0;
                } else if ((startPoint.x >= endPoint.x) && (startPoint.y <= endPoint.y)) {
                    quarter = 2;
                    degrees = 180;
                } else if ((startPoint.x >= endPoint.x) && (startPoint.y >= endPoint.y)) {
                    quarter = 3;
                    degrees = 180;
                } else if ((startPoint.x <= endPoint.x) && (startPoint.y >= endPoint.y)) {
                    quarter = 4;
                    degrees = 360;
                }

                radians = parseFloat(Math.asin((nearSide / distance).toFixed(2)));

                if (quarter === 4 || quarter === 2) {
                    degrees -=  parseFloat((radians * (180 / Math.PI)).toFixed(2));
                } else {
                    degrees += parseFloat((radians * (180 / Math.PI)).toFixed(2));
                }

                if (debug) {
                    console.log('Degrees: ' + degrees);
                    console.log('Quarter: ' + quarter);
                }

                return degrees; //following watches arrow
            };

            _internal.extendedTriangle = function (points, colors, debug) {
                var mainPath,
                    i,
                    cornerPoints,
                    distance,
                    triangles = [],
                    angle;

                if (points.length !== 3) {
                    throw 'Is NOT Triangle';
                }

                mainPath = new paper.Path();

                for (i = 0; i !== points.length; i++) {
                    mainPath.add(points[i]);
                }

                mainPath.closed = true;

                distance = points[0].getDistance(points[1]);
                angle = _internal.trigonometry.getAngle(points[0], points[1]);
                if (debug) {console.log(angle);}

                cornerPoints = [
                    points[0],
                    _internal.operators.addition([points[0], new paper.Point({length: distance / 3, angle: angle})]),
                    _internal.operators.addition([points[0], new paper.Point({length: distance / 3 * 2, angle: angle})]),
                    points[1]
                ];

                distance = points[1].getDistance(points[2]);
                angle = _internal.trigonometry.getAngle(points[1], points[2]);
                if (debug) {console.log(angle);}

                cornerPoints.push(_internal.operators.addition([points[1], new paper.Point({length: distance / 3, angle: angle})]));
                cornerPoints.push(_internal.operators.addition([points[1], new paper.Point({length: distance / 3 * 2, angle: angle})]));
                cornerPoints.push(points[2]);

                distance = points[2].getDistance(points[0]);
                angle = _internal.trigonometry.getAngle(points[2], points[0]);
                if (debug) {console.log(angle);}

                cornerPoints.push(_internal.operators.addition([points[2], new paper.Point({length: distance / 3, angle: angle})]));
                cornerPoints.push(_internal.operators.addition([points[2], new paper.Point({length: distance / 3 * 2, angle: angle})]));

                distance = cornerPoints[1].getDistance(cornerPoints[5]);
                angle = _internal.trigonometry.getAngle(cornerPoints[1], cornerPoints[5]);

                if (debug) {console.log(angle);}
                cornerPoints.push(_internal.operators.addition([cornerPoints[1], new paper.Point({length: distance / 2, angle: angle})]));

                if (debug) {
                    for (i = 0; i !== cornerPoints.length; i++) {
                         console.log(cornerPoints[i]);

                        var circle = new paper.Path.Circle({
                            center:  cornerPoints[i],
                            radius: 5,
                            fillColor: 'blue'
                        })
                    }
                }

                triangles.push(_internal.Polygon([cornerPoints[0], cornerPoints[1], cornerPoints[8]], (colors[0] || null)));
                triangles.push(_internal.Polygon([cornerPoints[8], cornerPoints[9], cornerPoints[7]], (colors[1] || null)));
                triangles.push(_internal.Polygon([cornerPoints[7], cornerPoints[6], cornerPoints[5]], (colors[2] || null)));
                triangles.push(_internal.Polygon([cornerPoints[1], cornerPoints[8], cornerPoints[9]], (colors[3] || null)));
                triangles.push(_internal.Polygon([cornerPoints[9], cornerPoints[7], cornerPoints[5]], (colors[4] || null)));
                triangles.push(_internal.Polygon([cornerPoints[1], cornerPoints[2], cornerPoints[9]], (colors[5] || null)));
                triangles.push(_internal.Polygon([cornerPoints[9], cornerPoints[4], cornerPoints[5]], (colors[6] || null)));
                triangles.push(_internal.Polygon([cornerPoints[9], cornerPoints[2], cornerPoints[4]], (colors[7] || null)));
                triangles.push(_internal.Polygon([cornerPoints[2], cornerPoints[3], cornerPoints[4]], (colors[8] || null)));
            };

            _internal.addBlock = function (blockID, position, radius) {
                var hexagon;

                switch (blockID) {
                case 0:
                    (function () {
                        var polygon,
                            triangle;

                        hexagon = _internal.Hexagon(position, radius);
                        polygon = _internal.Polygon([hexagon.segments[4].point, hexagon.segments[5].point, hexagon.segments[0].point, hexagon.bounds.center]);
                        _internal.cropImageByPath(0, polygon);

                        triangle = _internal.Polygon([
                            hexagon.segments[0].point,
                            hexagon.segments[1].point,
                            hexagon.bounds.center
                        ], _colorPattern[0]);

                        triangle = _internal.Polygon([
                            hexagon.segments[2].point,
                            hexagon.segments[3].point,
                            hexagon.bounds.center
                        ]);

                        _internal.cropImageByPath(2, triangle);

                        polygon = _internal.Polygon([
                            hexagon.segments[1].point,
                            hexagon.segments[2].point,
                            hexagon.bounds.center,
                            hexagon.segments[3],
                            hexagon.segments[4],
                            hexagon.bounds.center]);

                        _internal.cropImageByPath(1, polygon);
                    })();
                    break;
                case 1:
                    (function () {
                        var polygon,
                            triangle;

                        hexagon = _internal.Hexagon(position, radius);
                        polygon = _internal.Polygon([hexagon.segments[4].point, hexagon.segments[5].point, hexagon.segments[0].point, hexagon.bounds.center]);
                        _internal.cropImageByPath(1, polygon);

                        _internal.extendedTriangle([hexagon.segments[0].point,
                            hexagon.segments[1].point,
                            hexagon.bounds.center],
                            [
                                _colorPattern[2],
                                _colorPattern[2],
                                _colorPattern[1],
                                _colorPattern[0],
                                _colorPattern[0],
                                _colorPattern[2],
                                _colorPattern[2],
                                _colorPattern[3],
                                _colorPattern[1]
                            ]);

                        triangle = _internal.Polygon([
                            hexagon.segments[2].point,
                            hexagon.segments[3].point,
                            hexagon.bounds.center
                        ], _colorPattern[2]);

                        triangle = _internal.Polygon([
                            hexagon.segments[1].point,
                            hexagon.segments[2].point,
                            hexagon.bounds.center]);

                        _internal.cropImageByPath(0, triangle);

                        triangle = _internal.Polygon([
                            hexagon.segments[3].point,
                            hexagon.segments[4].point,
                            hexagon.bounds.center]);

                        _internal.cropImageByPath(2, triangle);
                    })();
                    break;
                case 2:
                    (function () {
                        var polygon,
                            triangle;

                        hexagon = _internal.Hexagon(position, radius);
                        polygon = _internal.Polygon([hexagon.segments[4].point, hexagon.segments[5].point, hexagon.segments[0].point, hexagon.bounds.center]);
                        _internal.cropImageByPath(0, polygon);

                        triangle = _internal.Polygon([
                            hexagon.segments[0].point,
                            hexagon.segments[1].point,
                            hexagon.bounds.center
                        ], _colorPattern[0]);

                        polygon = _internal.Polygon([
                            hexagon.segments[1].point,
                            hexagon.segments[2].point,
                            hexagon.bounds.center,
                            hexagon.segments[2].point,
                            hexagon.segments[3].point,
                            hexagon.bounds.center
                        ]);

                        _internal.cropImageByPath(2, polygon);

                        triangle = _internal.Polygon([
                            hexagon.segments[3].point,
                            hexagon.segments[4].point,
                            hexagon.bounds.center], _colorPattern[0]);
                    })();
                    break;
                case 3:
                    (function () {
                        var polygon,
                            triangle;

                        hexagon = _internal.Hexagon(position, radius);
                        polygon = _internal.Polygon([hexagon.segments[4].point, hexagon.segments[5].point, hexagon.segments[0].point, hexagon.bounds.center]);
                        _internal.cropImageByPath(0, polygon);

                        triangle = _internal.Polygon([
                            hexagon.segments[0].point,
                            hexagon.segments[1].point,
                            hexagon.bounds.center
                        ]);

                        _internal.cropImageByPath(2, triangle);


                        triangle = _internal.Polygon([
                            hexagon.segments[1].point,
                            hexagon.segments[2].point,
                            hexagon.bounds.center
                        ]);

                        _internal.cropImageByPath(0, triangle);

                        triangle = _internal.Polygon([
                            hexagon.segments[2].point,
                            hexagon.segments[3].point,
                            hexagon.bounds.center
                        ]);

                        _internal.cropImageByPath(1, triangle);

                        triangle = _internal.Polygon([
                            hexagon.segments[3].point,
                            hexagon.segments[4].point,
                            hexagon.bounds.center], _colorPattern[2]);
                    })();
                    break;
                case 4:
                    (function () {
                        var triangle;

                        hexagon = _internal.Hexagon(position, radius);

                        triangle = _internal.extendedTriangle([hexagon.segments[5].point, hexagon.bounds.center, hexagon.segments[4].point],
                            [
                                _colorPattern[2],
                                _colorPattern[0],
                                _colorPattern[4],
                                _colorPattern[1],
                                _colorPattern[0],
                                _colorPattern[2],
                                _colorPattern[2],
                                _colorPattern[2],
                                _colorPattern[0]
                            ]);

                        triangle = _internal.Polygon([
                            hexagon.segments[5].point,
                            hexagon.segments[0].point,
                            hexagon.bounds.center
                        ], _colorPattern[2]);


                        triangle = _internal.Polygon([
                            hexagon.segments[0].point,
                            hexagon.segments[1].point,
                            hexagon.bounds.center
                        ], _colorPattern[0]);

                        triangle = _internal.Polygon([
                            hexagon.segments[1].point,
                            hexagon.segments[2].point,
                            hexagon.bounds.center
                        ]);

                        _internal.cropImageByPath(0, triangle);

                        triangle = _internal.Polygon([
                            hexagon.segments[2].point,
                            hexagon.segments[3].point,
                            hexagon.bounds.center
                        ], _colorPattern[0]);

                        triangle = _internal.Polygon([
                            hexagon.segments[3].point,
                            hexagon.segments[4].point,
                            hexagon.bounds.center]);

                        _internal.cropImageByPath(2, triangle);
                    })();
                    break;
                case 5:
                    (function () {
                        var polygon,
                            triangle;

                        hexagon = _internal.Hexagon(position, radius);
                        polygon = _internal.Polygon([hexagon.segments[4].point, hexagon.segments[5].point, hexagon.segments[0].point, hexagon.bounds.center]);
                        _internal.cropImageByPath(1, polygon);

                        triangle = _internal.extendedTriangle([
                            hexagon.segments[0].point,
                            hexagon.segments[1].point,
                            hexagon.bounds.center],
                            [
                                _colorPattern[2],
                                _colorPattern[2],
                                _colorPattern[3],
                                _colorPattern[0],
                                _colorPattern[0],
                                _colorPattern[2],
                                _colorPattern[2],
                                _colorPattern[1],
                                _colorPattern[2]
                            ]);

                        triangle = _internal.Polygon([
                            hexagon.segments[1].point,
                            hexagon.segments[2].point,
                            hexagon.bounds.center
                        ]);

                        _internal.cropImageByPath(0, triangle);

                        triangle = _internal.Polygon([
                            hexagon.segments[2].point,
                            hexagon.segments[3].point,
                            hexagon.bounds.center
                        ], _colorPattern[0]);

                        triangle = _internal.Polygon([
                            hexagon.segments[3].point,
                            hexagon.segments[4].point,
                            hexagon.bounds.center],
                            _colorPattern[2]);
                    })();
                    break;
                case 6:
                    (function () {
                        var polygon,
                            triangle;

                        hexagon = _internal.Hexagon(position, radius);
                        polygon = _internal.Polygon([hexagon.segments[4].point, hexagon.segments[5].point, hexagon.segments[0].point, hexagon.bounds.center]);
                        _internal.cropImageByPath(0, polygon);

                        triangle = _internal.Polygon([
                            hexagon.segments[0].point,
                            hexagon.segments[1].point,
                            hexagon.bounds.center],
                            _colorPattern[0]);
                    })();
                    break;
                case 7:
                    (function () {
                        var polygon,
                            triangle;

                        hexagon = _internal.Hexagon(position, radius);
                        polygon = _internal.Polygon([hexagon.segments[4].point, hexagon.segments[5].point, hexagon.segments[0].point, hexagon.bounds.center]);
                        _internal.cropImageByPath(2, polygon);

                        triangle = _internal.extendedTriangle([
                            hexagon.segments[0].point,
                            hexagon.segments[1].point,
                            hexagon.bounds.center],
                            [
                                _colorPattern[2],
                                _colorPattern[1],
                                _colorPattern[1],
                                _colorPattern[2],
                                _colorPattern[0],
                                _colorPattern[2],
                                _colorPattern[3],
                                _colorPattern[5],
                                _colorPattern[1]
                            ]);

                        triangle = _internal.Polygon([
                            hexagon.segments[1].point,
                            hexagon.segments[2].point,
                            hexagon.bounds.center
                        ]);

                        _internal.cropImageByPath(1, triangle);

                        triangle = _internal.Polygon([
                            hexagon.segments[2].point,
                            hexagon.segments[3].point,
                            hexagon.bounds.center
                        ], _colorPattern[2]);

                        triangle = _internal.Polygon([
                            hexagon.segments[3].point,
                            hexagon.segments[4].point,
                            hexagon.bounds.center],
                            _colorPattern[0]);
                    })();
                    break;
                case 8:
                    (function () {
                        var polygon,
                            triangle;

                        hexagon = _internal.Hexagon(position, radius);
                        polygon = _internal.Polygon([hexagon.segments[4].point, hexagon.segments[5].point, hexagon.segments[0].point, hexagon.bounds.center]);
                        _internal.cropImageByPath(0, polygon);

                        triangle = _internal.Polygon([
                            hexagon.segments[0].point,
                            hexagon.segments[1].point,
                            hexagon.bounds.center],
                            _colorPattern[0]);

                        triangle = _internal.Polygon([
                            hexagon.segments[1].point,
                            hexagon.segments[2].point,
                            hexagon.bounds.center
                        ], _colorPattern[2]);

                        triangle = _internal.Polygon([
                            hexagon.segments[2].point,
                            hexagon.segments[3].point,
                            hexagon.bounds.center
                        ]);

                        _internal.cropImageByPath(1, triangle);

                        triangle = _internal.Polygon([
                            hexagon.segments[3].point,
                            hexagon.segments[4].point,
                            hexagon.bounds.center],
                            _colorPattern[2]);
                    })();
                    break;
                }

                return hexagon;
            };

            _internal.addBlockDecoration = function (decorationID, block, margin, radius) {
                switch (decorationID) {
                case 0:
                    (function () {
                        var newPoint = new paper.Point(block.segments[0].point.x,  block.segments[1].point.y - (block.bounds.center.y - block.segments[0].point.y)),
                            triangle = _internal.extendedTriangle([
                                block.segments[0].point,
                                block.segments[1].point,
                                newPoint],
                                [
                                    null,
                                    _colorPattern[2],
                                    null,
                                    _colorPattern[6],
                                    null,
                                    _colorPattern[2],
                                    null,
                                    _colorPattern[0],
                                    _colorPattern[2]
                                ]);
                    })();
                    break;
                case 1:
                    (function () {
                        var newPoint = new paper.Point(block.segments[2].point.x,  block.segments[1].point.y - (block.bounds.center.y - block.segments[2].point.y)),
                            triangle = _internal.extendedTriangle([
                                block.segments[2].point,
                                block.segments[1].point,
                                newPoint],
                                [
                                    _colorPattern[1],
                                    _colorPattern[1],
                                    _colorPattern[2],
                                    _colorPattern[0],
                                    _colorPattern[5],
                                    _colorPattern[1],
                                    _colorPattern[1],
                                    _colorPattern[1],
                                    _colorPattern[1]
                                ]);
                    })();
                    break;
                case 2:
                    (function () {
                        var newPoint = new paper.Point(block.segments[0].point.x - (block.bounds.center.x - block.segments[0].point.x),  block.bounds.center.y),
                            triangle = _internal.extendedTriangle([
                                newPoint,
                                block.segments[0].point,
                                block.segments[5].point],
                                [
                                    null,
                                    _colorPattern[2],
                                    _colorPattern[3],
                                    null,
                                    _colorPattern[0],
                                    null,
                                    _colorPattern[2],
                                    _colorPattern[5],
                                    _colorPattern[2]
                                ]);
                    })();
                    break;
                case 3:
                    (function () {
                        var newPoint = new paper.Point(block.segments[2].point.x,  block.segments[1].point.y - (block.bounds.center.y - block.segments[2].point.y)),
                            triangle = _internal.extendedTriangle([
                                block.segments[1].point,
                                newPoint,
                                block.segments[2].point],
                                [
                                    null,
                                    _colorPattern[2],
                                    _colorPattern[1],
                                    _colorPattern[0],
                                    _colorPattern[0],
                                    null,
                                    _colorPattern[2],
                                    _colorPattern[5],
                                    _colorPattern[2]
                                ]);
                    })();
                    break;
                case 4:
                    (function () {
                        var vectors = [],
                            lines = [],
                            i,
                            hexagon = _internal.Hexagon(new paper.Point((block.segments[2].point.x + (margin / 2)), block.segments[2].point.y - (margin / 2)), radius),
                            angle,
                            addLine = function (startPoint, endPoint) {
                                angle = _internal.trigonometry.getAngle(startPoint, endPoint);
                                vectors.push(_internal.operators.addition([startPoint, new paper.Point({length: radius, angle: angle})]));
                                lines.push(_internal.Polygon([startPoint, vectors[vectors.length - 1]], _colorPattern[5]));
                            },
                            circlePointIndexes = [1, 2, 4];

                        addLine(hexagon.bounds.center,  hexagon.segments[0].point);
                        addLine(hexagon.bounds.center,  hexagon.segments[1].point);
                        addLine(hexagon.bounds.center,  hexagon.segments[2].point);
                        addLine(hexagon.bounds.center,  hexagon.segments[4].point);

                        addLine(hexagon.segments[4].point,  hexagon.segments[3].point);
                        addLine(hexagon.segments[2].point,  hexagon.segments[3].point);
                        addLine(hexagon.segments[2].point,  hexagon.segments[1].point);

                        addLine(hexagon.segments[0].point,  new paper.Point(hexagon.segments[0].point.x, hexagon.segments[0].point.y - radius));
                        addLine(hexagon.segments[2].point,  new paper.Point(hexagon.segments[2].point.x, hexagon.segments[2].point.y - radius));


                        for (i = 0; i !== circlePointIndexes.length; i++) {
                            _internal.Circle(hexagon.segments[circlePointIndexes[i]].point, 3, _colorPattern[5]);
                        }

                        _internal.Circle(hexagon.bounds.center, 2, _colorPattern[0]);

                        return lines;
                    })();
                    break;
                case 5:
                    (function () {
                        var vectors = [],
                            lines = [],
                            i,
                            hexagon = _internal.Hexagon(new paper.Point((block.segments[0].point.x - (margin / 2)), block.segments[2].point.y - (margin / 2)), radius),
                            angle,
                            addLine = function (startPoint, endPoint) {
                                angle = _internal.trigonometry.getAngle(startPoint, endPoint);
                                vectors.push(_internal.operators.addition([startPoint, new paper.Point({length: radius, angle: angle})]));
                                lines.push(_internal.Polygon([startPoint, vectors[vectors.length - 1]], '#f7f3e7'));
                            },
                            circlePointIndexes = [1, 2, 4];

                        addLine(hexagon.bounds.center,  hexagon.segments[0].point);
                        addLine(hexagon.bounds.center,  hexagon.segments[1].point);
                        addLine(hexagon.bounds.center,  hexagon.segments[2].point);
                        addLine(hexagon.bounds.center,  hexagon.segments[4].point);

                        addLine(hexagon.segments[4].point,  hexagon.segments[3].point);
                        addLine(hexagon.segments[2].point,  hexagon.segments[3].point);
                        addLine(hexagon.segments[2].point,  hexagon.segments[1].point);

                        addLine(hexagon.segments[0].point,  new paper.Point(hexagon.segments[0].point.x, hexagon.segments[0].point.y - radius));
                        addLine(hexagon.segments[2].point,  new paper.Point(hexagon.segments[2].point.x, hexagon.segments[2].point.y - radius));


                        for (i = 0; i !== circlePointIndexes.length; i++) {
                            _internal.Circle(hexagon.segments[circlePointIndexes[i]].point, 3, '#f7f3e7');
                        }

                        _internal.Circle(hexagon.bounds.center, 2, 'black');

                        return lines;
                    })();
                    break;
                }
            };

            _internal.init(canvas);
        };

        return Navigation;
    });
})();
