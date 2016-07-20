'use strict';

var round = require('lodash/round');

module.exports = function formatFuel(fuel) {
  return round(fuel || 0, 2) + ' gallons';
};
