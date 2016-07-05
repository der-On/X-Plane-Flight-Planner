'use strict';

var Search = require('./search');
var expect = require('expect.js');

var baseUrl = 'http://localhost:' + (process.env.PORT || 8080);
var cp = require('child_process');
var server;

describe('lib/search', function () {
  this.timeout(20000);
  var search = Search(baseUrl);

  before(function (done) {
    server = cp.fork('./tasks/serve', {
      env: process.env
    });
    setTimeout(done, 500);
  });

  after(function () {
    server.kill();
  });

  it('should load index', function () {
    return search.loadIndex()
      .then(function (search) {
        expect(Object.keys(search.airports).length > 0).to.be(true);
        expect(Object.keys(search.navaids).length > 0).to.be(true);
        expect(Object.keys(search.fixes).length > 0).to.be(true);

        return Promise.resolve();
      });
  });

  it('should find airport EDDP', function () {
    return search.find('EDDP')
      .then(function (results) {

        expect(results.airports.length).to.be(1);
        expect(results.navaids.length).to.be(0);
        expect(results.fixes.length).to.be(0);

        expect(results.airports[0].label).to.be('EDDP');
      });
  });
});
