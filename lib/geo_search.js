'use strict';

require('./fetch');
var partial = require('lodash/partial');
var flatten = require('lodash/flatten');
var lineCollidesWithBox = require('./utils/line_collides_with_box');
require('es6-promise-series')(Promise);

function airwaysFilter(bounds) {
  var s = bounds[0];
  var w = bounds[1];
  var n = bounds[2];
  var e = bounds[3];

  return function (airway) {
    return lineCollidesWithBox(
      airway.fromLon, airway.fromLat,
      airway.toLon, airway.toLat,
      w, n, e, s
    );
  };
}

function addNavItemType(type) {
  return function (item) {
    item._type = type;
    return item;
  };
}

module.exports = function GeoSearch (baseUrl) {
  baseUrl = baseUrl + '/data';
  var geoSearch = {};

  geoSearch.cacheLifetime = 2;
  geoSearch.requestsCount = {
    'airports.json': 0,
    'navaids.json': 0,
    'fixes.json': 0
  };
  geoSearch.airways = [];
  geoSearch.cache = {
    'airports.json': {},
    'navaids.json': {},
    'fixes.json': {}
  };

  geoSearch.getCache = function (filename, latLon) {
    return geoSearch.cache[filename][latLon.join(',')] || null;
  };

  geoSearch.setCache = function (filename, latLon, results) {
    geoSearch.cache[filename][latLon.join(',')] = results;
    return results;
  };
  geoSearch.clearCache = function (filename) {
    geoSearch.cache[filename] = {};
  };

  geoSearch.loadAirways = function () {
    return fetch(baseUrl + '/airways.json')
      .then(function (response) {
        return response.status === 200 ?
          response.json()
        : [];
      })
      .then(function (airways) {
        geoSearch.airways = airways.map(addNavItemType('airway'));
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

  geoSearch.findInBounds = function (bounds, filename, type) {
    geoSearch.requestsCount[filename]++;

    if (geoSearch.requestsCount[filename] % geoSearch.cacheLifetime + 1 === 0) {
      geoSearch.clearCache(filename);
    }

    return Promise.series(
      geoSearch.latLonsForBounds(bounds)
        .map(function (latLon) {
          return partial(geoSearch.findForLatLon, latLon, filename);
        })
    )
      .then(function (datasets) {
        return Promise.resolve(
          flatten(datasets)
          .map(addNavItemType(type))
        );
      });
  };

  geoSearch.findForLatLon = function (latLon, filename) {
    var cached = geoSearch.getCache(filename, latLon);

    if (cached) {
      return Promise.resolve(cached);
    }

    return fetch(geoSearch.urlForLatLon(latLon, filename))
      .then(function (response) {
        // fallback to empty dataset if an error occurs
        return response.status === 200 ?
          response.json()
        : Promise.resolve(
          geoSearch.setCache(filename, latLon, [])
        );
      })
      .then(function (data) {
        return Promise.resolve(
          geoSearch.setCache(filename, latLon, data)
        );
      })
      .catch(function (error) {
        console.error(error);
        // fallback to empty dataset if an error occurs
        return Promise.resolve(
          geoSearch.setCache(filename, latLon, [])
        );
      });
  };

  geoSearch.findAirportsInBounds = function (bounds) {
    return geoSearch.findInBounds(bounds, 'airports.json', 'airport');
  };

  geoSearch.findFixesInBounds = function (bounds) {
    return geoSearch.findInBounds(bounds, 'fixes.json', 'fix');
  };

  geoSearch.findNavaidsInBounds = function (bounds) {
    return geoSearch.findInBounds(bounds, 'navaids.json', 'navaid');
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
