'use strict';

var padStart = require('lodash/padStart');

module.exports = function formatDuration (duration) {
  if (!duration) return 'n.a.';
  var hours = Math.floor(duration);
  var mins = Math.round((duration - hours) * 60);
  return padStart(hours.toString(), '0', 2) + ':' + padStart(mins.toString(), '0', 2);
};
