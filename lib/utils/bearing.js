'use strict';

var bearing = require('turf-bearing');

module.exports = function (latLngFrom, latLngTo) {
  return bearing({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: latLngFrom
    }
  }, {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: latLngTo
    }
  });
};
