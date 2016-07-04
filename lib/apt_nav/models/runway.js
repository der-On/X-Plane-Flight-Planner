'use strict';

var types = {
  100: 'Land Runway',
  101: 'Water Runway',
  102: 'Helipad',
};

module.exports = function Runway (data) {
  return Object.assign({
    type: null,
    width: 0,
    surfaceType: null,
    numberStart: null,
    numberEnd: null,
    latStart: null,
    lonStart: null,
    latEnd: null,
    lonEnd: null,
    length: 0
  }, data || {});
};

module.exports.typeName = function (runway) {
  return types[runway.type] || 'Runway';
};

module.exports.surfaceTypeName = function (runway) {
  return null;
};
