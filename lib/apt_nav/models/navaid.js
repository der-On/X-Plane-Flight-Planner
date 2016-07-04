'use strict';

var types = {
  2: 'NDB',
  3: 'VOR',
  4: 'LOC',
  5: 'LOC',
  6: 'Glideslope',
  7: 'OM',
  8: 'MM',
  9: 'IM',
  12: 'DME',
  13: 'DME'
};

module.exports = function Navaid (data) {
  return Object.assign({
    id: null,
    type: null,
    lat: 0,
    lon: 0,
    elevation: 0,
    frequency: 0,
    range: 0,
    icao: null,
    identifier: null,
    runwayNumber: null,
    name: null,
    variation: null,
    bearing: 0,
    bias: 0
  }, data || {});
};

module.exports.typeName = function (naviad) {
  return types[navaid.type] || null;
};
