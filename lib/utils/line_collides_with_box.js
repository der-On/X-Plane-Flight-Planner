'use strict';

var boxCollidesWithBox = require('./box_collides_with_box');

module.exports = function lineCollidesWithBox (x1, y1, x2, y2, left, top, right, bottom) {
  var xMin = Math.min(x1, x2);
  var xMax = Math.max(x1, x2);
  var yMin = Math.min(y1, y2);
  var yMax = Math.max(y1, y2);
  var bLeft = Math.min(left, right);
  var bRight = Math.max(left, right);
  var bTop = Math.min(top, bottom);
  var bBottom = Math.max(top, bottom);
  
  return boxCollidesWithBox(xMin, yMin, xMax, yMax, bLeft, bTop, bRight, bBottom);
};
