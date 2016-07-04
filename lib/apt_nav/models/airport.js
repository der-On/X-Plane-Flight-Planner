'use strict';

var property = require('lodash/property');
var isNil = require('lodash/isNil');
var negate = require('lodash/negate');
var sum = require('lodash/sum');

function average (array) {
  return sum(array) / array.length;
}

var types = {
  1: 'Airport',
  2: 'Seaport',
  3: 'Heliport'
};

module.exports = function Airport (data) {
  return Object.assign({
    type: null,
    icao: null,
    lat: null,
    lon: null,
    communications: [],
    elevation: 0,
    tower: false,
    name: null,
    runways: []
  }, data || {});
};

module.exports.getTypeName = function (airport) {
  return types[airport.type] || 'Airport';
};

module.exports.calcLatLon = function (airport) {
  var lats = [].concat(
    airport.runways
      .map(property('latStart')),
    airport.runways
      .map(property('latEnd'))
  ).filter(negate(isNil));

  var lons = [].concat(
    airport.runways
      .map(property('lonStart')),
    airport.runways
      .map(property('latEnd'))
  ).filter(negate(isNil));

  if (!lats.length || !lons.length) return;

  airport.lat = average(lats);
  airport.lon = average(lons);
};
