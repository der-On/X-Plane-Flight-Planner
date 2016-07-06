'use strict';

var uuid = require('uuid').v4;

module.exprots = function FlightPlan (data) {
  return Object.assign({
    id: uuid(),
    title: null,
    color: null,
    visible: null,
    cruiseSpeed: null,
    aircraft: null,
    fuelConsumption: null,
    payload: null
  }, data);
};
