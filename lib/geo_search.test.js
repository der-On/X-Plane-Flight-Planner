'use strict';

var expect = require('expect.js');
var GeoSearch = require('./geo_search');

var baseUrl = 'http://localhost:' + (process.env.PORT || 8080);
var cp = require('child_process');
var server;

describe('lib/geo_search', function () {
  this.timeout(20000);
  var geoSearch = GeoSearch(baseUrl);

  before(function (done) {
    server = cp.fork('./tasks/serve', {
      env: process.env
    });
    setTimeout(done, 500);
  });

  after(function () {
    server.kill();
  });

  it('should load airways', function () {
    return geoSearch.loadAirways()
      .then(function (geoSearch) {
        expect(geoSearch.airways.length > 0).to.be(true);

        return Promise.resolve();
      });
  });

  it('should load single file', function () {
    return geoSearch.findForLatLon([51, 12], 'airports.json')
      .then(function (airports) {
        expect(airports.length > 0).to.be(true);

        return Promise.resolve();
      });
  });

  it('should find airports within bounds', function () {
    return geoSearch.findAirportsInBounds([52, 12, 51, 11])
      .then(function (airports) {
        expect(airports.length > 0).to.be(true);

        return Promise.resolve();
      });
  });

  it('should find all items within bounds', function () {
    return geoSearch.findAllInBounds([52, 11, 51, 12])
      .then(function (results) {
        expect(results.airports.length > 0).to.be(true);
        expect(results.navaids.length > 0).to.be(true);
        expect(results.fixes.length > 0).to.be(true);
        expect(results.airways.length > 0).to.be(true);
        expect(results.airways.length < geoSearch.airways.length).to.be(true);
        
        return Promise.resolve();
      });
  });
});
