'use strict';

var uuid = require('uuid').v4;

module.exports = function FlightPlan (data) {
  return Object.assign({
    id: uuid(),
    title: null,
    color: null,
    visible: true,
    cruiseSpeed: null,
    aircraft: null,
    fuelConsumption: null,
    payload: null
  }, data);
};
