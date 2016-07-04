'use strict';

var types = {
  50: 'Recorded',
  51: 'Unicorn',
  52: 'CLD',
  53: 'GND',
  54: 'TWR',
  55: 'APP',
  56: 'DEP'
};

module.exports = function Communication (data) {
  return Object.assign({
    type: null,
    frequency: null,
    name: null
  }, data || {});
};

module.exports.typeName = function (communication) {
  return types[communication.type] || '';
};
