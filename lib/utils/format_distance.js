'use strict';
var round = require('lodash/round');

var METERS_PER_NM = 1852;

module.exports = function formatDistance (meters) {
  return round(meters / METERS_PER_NM, 2) + 'nm';
};
