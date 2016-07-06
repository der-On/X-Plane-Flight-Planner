'use strict';

var debug = require('debug')('x-plane-flight-planner:import')
var fs = require('fs');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var path = require('path');
var parser = require('../lib/apt_nav/parser')();
var xplaneDir = process.env.XPLANE_DIR || null;
var dataPath = path.join(__dirname, '../dist/data');
var searchIndexPath = path.join(__dirname, '../dist/search_index');
var ucfirst = require('../lib/utils/ucfirst');
var property = require('lodash/property');

if (!xplaneDir) {
  throw new Error('Missing XPLANE_DIR');
}

var airportsDatPath = path.join(xplaneDir, './Resources/default scenery/default apt dat/Earth nav data/apt.dat');
var airwaysDatPath = path.join(xplaneDir, './Resources/default data/earth_awy.dat');
var fixesDatPath = path.join(xplaneDir, './Resources/default data/earth_fix.dat');
var navaidsDatPath = path.join(xplaneDir, './Resources/default data/earth_nav.dat');

function clear() {
  var lat, lon, dest;

  for (lat = -90; lat <= 90; lat++) {
    for (lon = -180; lon <= 180; lon++) {
      dest = path.join(dataPath, lat.toString(), lon.toString());
      rimraf.sync(dest);
    }
  }
}

function mapToLatLon(data) {
  return function (item) {
    var lat = Math.floor(item.lat);
    var lon = Math.floor(item.lon);

    if (!data[lat]) data[lat] = {};
    if (!data[lat][lon]) data[lat][lon] = [];

    data[lat][lon].push(item);
  };
}

function mapLatLonToSelectors(data, selectors) {
  return function (item) {
    selectors.forEach(function (selector) {
      var key = selector(item);
      if (!key) return;
      if (!data[key]) data[key] = [];

      data[key].push({
        id: item.id,
        label: key,
        lat: item.lat,
        lon: item.lon
      });
    });
  };
}

function writeToLatLon(data, filename) {
  var lat, lon;

  for (lat = -90; lat <= 90; lat++) {
    for (lon = -180; lon <= 180; lon++) {
      if (data[lat] && data[lat][lon]) {
        write(data[lat][lon], lat, lon, filename);
      }
    }
  }
}

function write(data, lat, lon, filename) {
  var dest = path.join(dataPath, lat.toString(), lon.toString(), filename);
  mkdirp.sync(path.dirname(dest));
  writeJson(data, dest);
}

function writeJson(data, dest) {
  fs.writeFileSync(dest + '.json', JSON.stringify(data, null, 2), 'utf8');
}

function writeSearchIndex(list, filename, selectors) {
  var dest = path.join(searchIndexPath, filename);

  if (fs.existsSync(dest)) {
    fs.unlinkSync(dest);
  }

  var index = {};

  list.forEach(mapLatLonToSelectors(index, selectors));

  writeJson(index, dest);
}

function importData(filename, src, searchSelectors) {
  debug(src);

  if (!fs.existsSync(src)) {
    throw new Error(ucfirst(filename) + ' data file not found.');
  }

  var list = parser['parse' + ucfirst(filename)](src);
  var data = {};

  list.forEach(mapToLatLon(data));

  writeToLatLon(data, filename);
  writeSearchIndex(list, filename, searchSelectors);
}

function importAirways(src) {
  debug(src);

  if (!fs.existsSync(src)) {
    throw new Error('Airways data file not found.');
  }

  var dest = path.join(dataPath, 'airways');
  if (fs.existsSync(dest)) {
    fs.unlinkSync(dest);
  }
  var data = parser.parseAirways(src);
  writeJson(data, dest);
}

clear();
importData('airports', airportsDatPath, [property('icao'), property('name')]);
importData('fixes', fixesDatPath, [property('name')]);
importData('navaids', navaidsDatPath, [property('name'), property('identifier')]);
importAirways(airwaysDatPath);
