'use strict';

var MPS_PER_KTS = 0.51444444444;

/**
 * returns duration in hours
 * @param  {Number} distance in meters
 * @param  {Number} speed    in kts
 * @return {Number}          duration in hours
 */
module.exports = function duration(distance, speed) {
  return distance / ((speed || 0) * MPS_PER_KTS) / 1000;
};
