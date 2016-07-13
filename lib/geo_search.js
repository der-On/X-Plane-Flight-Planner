'use strict';

require('./fetch');
var partial = require('lodash/partial');
var flatten = require('lodash/flatten');
require('es6-promise-series')(Promise);

function airwaysFilter(bounds) {
  var n = bounds[0];
  var e = bounds[1];
  var s = bounds[2];
  var w = bounds[3];

  return function (airway) {
    return (
      // is within
      airway.fromLon >= w && airway.fromLon <= e &&
      airway.toLon >= w && airway.toLon <= e &&
      airway.fromLat >= s && airway.fromLat <= n &&
      airway.toLat >= s && airway.toLat <= n
    ) || !(
      // is left to left
      (airway.fromLon < w && airway.toLon <= w) ||
      // is right to right
      (airway.fromLon > e && airway.toLon > e) ||
      // is above top
      (airway.fromLat < n && airway.toLat < n) ||
      // is below bottom
      (airway.fromLat > s && airway.toLat > s)
    );
  };
}

module.exports = function GeoSearch (baseUrl) {
  baseUrl = baseUrl + '/data';
  var geoSearch = {};

  geoSearch.airways = [];

  geoSearch.loadAirways = function () {
    return fetch(baseUrl + '/airways.json')
      .then(function (response) {
        return response.status === 200 ?
          response.json()
        : [];
      })
      .then(function (airways) {
        geoSearch.airways = airways;
        return Promise.resolve(geoSearch);
      })
      .catch(function (error) {
        geoSearch.airways = [];
        return Promise.resolve(geoSearch);
      });
  };

  geoSearch.latLonsForBounds = function (bounds) {
    var n = Math.floor(bounds[0]);
    var e = Math.floor(bounds[1]);
    var s = Math.floor(bounds[2]);
    var w = Math.floor(bounds[3]);
    var lonMin = Math.min(w, e);
    var lonMax = Math.max(w, e);
    var latMin = Math.min(n, s);
    var latMax = Math.max(n, s);
    var latLons = [];
    var lat, lon;

    for (lat = latMin; lat <= latMax; lat++) {
      for (lon = lonMin; lon <= lonMax; lon++) {
        latLons.push([lat, lon]);
      }
    }

    return latLons;
  };

  geoSearch.urlForLatLon = function (latLon, filename) {
    return baseUrl + '/' + latLon.join('/') + '/' + filename;
  };

  geoSearch.findAllInBounds = function (bounds) {
    return Promise.series([
      partial(geoSearch.findAirportsInBounds, bounds),
      partial(geoSearch.findFixesInBounds, bounds),
      partial(geoSearch.findNavaidsInBounds, bounds),
      partial(geoSearch.findAirwaysInBounds, bounds)
    ])
      .then(function (datasets) {
        return Promise.resolve({
          airports: datasets[0],
          fixes: datasets[1],
          navaids: datasets[2],
          airways: datasets[3]
        });
      });
  };

  geoSearch.findInBounds = function (bounds, filename) {
    return Promise.series(
      geoSearch.latLonsForBounds(bounds)
        .map(function (latLon) {
          return partial(geoSearch.findForLatLon, latLon, filename);
        })
    )
      .then(function (datasets) {
        return Promise.resolve(flatten(datasets));
      });
  };

  geoSearch.findForLatLon = function (latLon, filename) {
    return fetch(geoSearch.urlForLatLon(latLon, filename))
      .then(function (response) {
        // fallback to empty dataset if an error occurs
        return response.status === 200 ?
          response.json()
        : Promise.resolve([]);
      })
      .then(function (data) {
        return Promise.resolve(data);
      })
      .catch(function (error) {
        console.error(error);
        // fallback to empty dataset if an error occurs
        return Promise.resolve([]);
      });
  };

  geoSearch.findAirportsInBounds = function (bounds) {
    return geoSearch.findInBounds(bounds, 'airports.json');
  };

  geoSearch.findFixesInBounds = function (bounds) {
    return geoSearch.findInBounds(bounds, 'fixes.json');
  };

  geoSearch.findNavaidsInBounds = function (bounds) {
    return geoSearch.findInBounds(bounds, 'navaids.json');
  };

  geoSearch.findAirwaysInBounds = function (bounds) {
    return Promise.resolve(
      geoSearch
        .airways
        .filter(airwaysFilter(bounds))
    );
  };

  return geoSearch;
};
