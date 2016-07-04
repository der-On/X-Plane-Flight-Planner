'use strict';

var types = {
  1: 'low',
  2: 'high'
};

module.exports = function Airway (data) {
  return Object.assign({
    id: null,
    name: null,
    fromName: null,
    toName: null,
    fromLat: null,
    fromLon: null,
    toLat: null,
    toLon: null,
    type: null,
    elevationVase: 0,
    elevationTop: 0
  }, data || {});
};

module.exports.typeName = function (airway) {
  return types[airway.type] || 'Airway';
};
