'use strict';

/**
 * Calculates total fuel consumption
 * @param  {Number} duration    in hours
 * @param  {Number} consumption gallons per hour
 * @return {Number}             total gallons
 */
module.exports = function fuel (duration, consumption) {
  return duration * (consumption || 0);
};
