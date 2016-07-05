'use strict';

require('./utils/string');
require('./fetch');
var flatten = require('lodash/flatten');

module.exports = function Search (baseUrl) {
  baseUrl = baseUrl + '/search_index';
  var search = {};
  search.airports = [];
  search.navaids = [];
  search.fixes = [];

  search.loadIndex = function () {
    return Promise.all([
      fetch(baseUrl + '/airports.json'),
      fetch(baseUrl + '/fixes.json'),
      fetch(baseUrl + '/navaids.json')
    ])
      .then(function (responses) {
        return Promise.all([
          responses[0].json(),
          responses[1].json(),
          responses[2].json()
        ]);
      })
      .then(function (indexes) {
        search.airports = indexes[0];
        search.navaids = indexes[1];
        search.fixes = indexes[2];
        search.airportKeys = Object.keys(search.airports);
        search.navaidKeys = Object.keys(search.navaids);
        search.fixKeys = Object.keys(search.fixes);

        return Promise.resolve(search);
      });
  };

  search.find = function (q) {
    return Promise.all([
      search.findAirports(q),
      search.findNavaids(q),
      search.findFixes(q)
    ])
      .then(function (results) {
        return Promise.resolve({
          airports: results[0],
          navaids: results[1],
          fixes: results[2]
        });
      });
  };

  search.findIn = function (q, collection, keys) {
    q = q.trim().toLowerCase();

    // TODO: make this iterations async
    // to prevent UI locking

    return Promise.resolve(
      flatten(
        keys.filter(function (key) {
          return key.toLowerCase().indexOf(q) !== -1;
        })
        .map(function (key) {
          return collection[key];
        })
      )
    );
  };

  search.findAirports = function (q) {
    return search.findIn(q, search.airports, search.airportKeys);
  };

  search.findNavaids = function (q) {
    return search.findIn(q, search.navaids, search.navaidKeys);
  };

  search.findFixes = function (q) {
    return search.findIn(q, search.fixes, search.fixKeys);
  };

  return search;
};
