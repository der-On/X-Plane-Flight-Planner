'use strict';

var L = require('leaflet');

function toLatLng(latLng) {
  return L.latLng(latLng[0], latLng[1]);
}

/**
 * Returns distance in meters
 * @param  {Array} latLngs list of lat lon arrays
 * @return {Number}         total distance in meters
 */
module.exports = function (latLngs) {
  return latLngs
    .map(toLatLng)
    .reduce(function (distance, latLng, index, latLngs) {
      return index > 0 ?
        latLng.distanceTo(latLngs[index - 1])
      : distance;
    }, 0);
};
