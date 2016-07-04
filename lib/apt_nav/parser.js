'use strict';

var debug = require('debug')('x-plane-flight-planner:AptNavParser');
require('../string_utils');

var FileLineReader = require('../file_line_reader').FileLineReader;
var Airport = require('./models/airport');
var Runway = require('./models/runway');
var Airway = require('./models/airway');
var Navaid = require('./models/navaid');
var Fix = require('./models/fix');
var Communication = require('./models/communication');

function removeDuplicateWhitespace(str) {
  return str.replace(/\s+/g, " ");
}

module.exports = function AptNavParser () {
  var parser = {};

  parser.parseInfo = function (file)
  {
    var info, line;
    var frd = new FileLineReader(file);

    if (frd.hasNextLine()) {
      line = frd.nextLine();

      if (frd.hasNextLine()) {
        line = frd.nextLine();

        info = line
          .trim()
          .explode('. ',2)[0]
          .trim()
          .explode(', ',3);

        return {
          formatVersion: parseInt(
            info[0]
              .trim()
              .explode(' - ',2)[0]
              .replace('Version','')
            ),
          dataCycle: info[0]
            .trim()
            .explode(', ',3)[0]
            .trim()
            .explode(' - ',2)[1]
            .trim()
            .replace('data cycle ',''),
          build: parseInt(
            info[1]
            .trim()
            .replace('build ','')
          ),
          metadata: info[2]
            .trim()
            .replace('metadata ','')
        };
      }
    }

    return null;
  }

  parser.parseAirports = function (file)
  {
    var frd = new FileLineReader(file);

    var id = 0;
    var eof = false;
    var line = null;
    var lineParts = null;
    var subParts = null;
    var lineCode = null;
    var airport = null;
    var runway = null;
    var communication = null;
    var airports = [];
    var airportEnd = false;
    var airportStarted = false;

    // skip first 3 lines, as those contain the header
    if (frd.hasNextLine()) frd.nextLine(); else return airports;
    if (frd.hasNextLine()) frd.nextLine(); else return airports;
    if (frd.hasNextLine()) frd.nextLine(); else return airports;

    while(!eof) {
      if(frd.hasNextLine()) {
        // remove duplicate whitespaces from line for better parsing
        line = removeDuplicateWhitespace(frd.nextLine());

         // only one character wich is new line, so airport ended
        if (line.length < 2) {
          airportEnd = true;
          lineCode = 0;
        } else { // something else
          airportEnd = false;
          lineParts = line.explode(' ',2);
          lineCode = parseInt(lineParts[0]);
        }

        if (lineCode !== 99) {
          // airport started
          if (lineCode === 1 || lineCode === 16 || lineCode === 17) {
            airportStarted = true;
            subParts = lineParts[1]
              .trim()
              .explode(' ',5);

            if (subParts && subParts.length === 5) {
              id++;
              airport = Airport();
              airport.type = lineCode;
              airport.elevation = parseInt(subParts[0]);
              airport.tower = (parseInt(subParts[1]) === 1) ? true : false;
              airport.icao = subParts[3];
              airport.id = id;
              airport.name = subParts[4];
              airport.runways = [];
            }
          }

          // runway started
          if (lineCode === 100 || lineCode === 101 || lineCode === 102) {
            runway = Runway();

            // land runway
            if (lineCode == 100) {
              runway.type = lineCode;

              subParts = lineParts[1]
                .trim()
                .explode(' ',8);

              if (subParts && subParts.length === 8) {
                runway.width = parseFloat(subParts[0]);
                runway.surfacetype = parseInt(subParts[1]);

                // runway start
                subParts = subParts[7]
                  .trim()
                  .explode(' ',10);

                if( subParts && subParts.length === 10) {
                  runway.numberStart = subParts[0];
                  runway.latStart = parseFloat(subParts[1]);
                  runway.lonStart = parseFloat(subParts[2]);
                }

                // runway end
                subParts = subParts[9]
                  .trim()
                  .explode(' ',9);

                if (subParts && subParts.length === 9) {
                  runway.numberEnd = subParts[0];
                  runway.latEnd = parseFloat(subParts[1]);
                  runway.lonEnd = parseFloat(subParts[2]);
                }
              }
            }

            // water runway
            if (lineCode === 101) {
              runway.type = lineCode;
              subParts = lineParts[1]
                .trim()
                .explode(' ',3);

              if (subParts && subParts.length === 3) {
                runway.width = parseFloat(subParts[0]);

                // runway start
                subParts = subParts[2]
                  .trim()
                  .explode(' ',4);

                if (subParts && subParts.length === 4) {
                  runway.numberStart = subParts[0];
                  runway.latStart = parseFloat(subParts[1]);
                  runway.lonStart = parseFloat(subParts[2]);
                }

                // runway end
                subParts = subParts[3]
                  .trim()
                  .explode(' ',3);

                if (subParts && subParts.length === 3) {
                  runway.numberEnd = subParts[0];
                  runway.latEnd = parseFloat(subParts[1]);
                  runway.lonEnd = parseFloat(subParts[2]);
                }
              }
            }

            // helipad runway
            if (lineCode === 102) {
              runway.type = lineCode;
              subParts = lineParts[1]
                .trim()
                .explode(' ',11);

              if (subParts && subParts.length === 11) {
                runway.surfaceType = parseInt(subParts[6]);
                runway.length = parseFloat(subParts[4]);
                runway.width = parseFloat(subParts[5]);

                // runway start
                runway.numberStart = subParts[0];
                runway.latStart = parseFloat(subParts[1]);
                runway.lonStart = parseFloat(subParts[2]);
              }
            }

            // add runway to airport
            if (airport) {
              airport.runways.push(runway);
            }
          }

          // communication started
          if (lineCode >= 50 && lineCode <= 56) {
            communication = Communication();

            communication.type = lineCode;
            subParts = lineParts[1]
              .trim()
              .explode(' ',2);

            if (subParts && subParts.length === 2) {
              communication.frequency = parseInt(subParts[0]);
              communication.name = subParts[1];
            }

            if (airport) {
              airport.communications.push(communication);
            }
          }

          if (airportEnd && airport) {
            Airport.calcLatLon(airport);
            airports.push(airport);
            debug('Found airport: %s - %s', airport.icao, airport.name);
          }
        }

        if (lineCode === 99) eof = true;
      } else eof = true;
    }

    return airports;
  };

  parser.parseNavaids = function (file)
  {
    var frd = new FileLineReader(file);

    var eof = false;
    var line = null;
    var lineParts = null;
    var subParts = null;
    var lineCode = null;
    var navaid = null;
    var navaids = [];
    var id = 0;

    // skip first 3 lines, as those contain the header
    if (frd.hasNextLine()) frd.nextLine(); else return navaids;
    if (frd.hasNextLine()) frd.nextLine(); else return navaids;
    if (frd.hasNextLine()) frd.nextLine(); else return navaids;

    while (!eof) {
      if (frd.hasNextLine()) {
        // remove duplicate whitespaces from line for better parsing
        line = removeDuplicateWhitespace(frd.nextLine());

        // only one character wich is new line
        if (line.length === 1) {
          lineCode = 0;
        } else { // something else
          lineParts = line.explode(' ',2);
          lineCode = parseInt(lineParts[0]);
        }

        if (lineCode !== 99) {
          // navaid found
          if ((lineCode >= 2 && lineCode <= 9) || (lineCode >= 12 && lineCode <= 13)) {
            navaid = Navaid();
            id++;
            navaid.id = id;
            navaid.type = lineCode;

            subParts = lineParts[1]
              .trim()
              .explode(' ',6);

            if (subParts && subParts.length === 6) {
              navaid.lat = parseFloat(subParts[0]);
              navaid.lon = parseFloat(subParts[1]);
              navaid.elevation = parseInt(subParts[2]);
              navaid.frequency = parseInt(subParts[3]);
              navaid.range = parseInt(subParts[4]);

              // NDB
              if (lineCode === 2) {
                subParts = subParts[5]
                  .trim()
                  .explode(' ',3);

                if (subParts && subParts.length === 3) {
                  navaid.identifier = subParts[1];
                  navaid.name = subParts[2];
                }
              }

              // VOR
              if (lineCode === 3) {
                subParts = subParts[5]
                  .trim()
                  .explode(' ',3);

                if(subParts && subParts.length == 3) {
                  navaid.variation = parseFloat(subParts[0]);
                  navaid.identifier = subParts[1];
                  navaid.name = subParts[2];
                }
              }

              // LOC or Glideslope
              if (lineCode >= 4 && lineCode <= 6) {
                subParts = subParts[5]
                  .trim()
                  .explode(' ',5);

                if (subParts && subParts.length === 5) {
                  navaid.bearing = parseFloat(subParts[0]);
                  navaid.identifier = subParts[1];
                  navaid.icao = subParts[2];
                  navaid.runwayNumber = subParts[3];
                  navaid.name = subParts[4];
                }
              }

              // Marker beacons
              if (lineCode >= 7 && lineCode <= 9) {
                subParts = subParts[5]
                  .trim()
                  .explode(' ',5);

                if(subParts && subParts.length === 5) {
                  navaid.bearing = parseFloat(subParts[0]);
                  navaid.icao = subParts[2];
                  navaid.runwayNumber = subParts[3];
                  navaid.name = subParts[4];
                }
              }

              // DME
              if (lineCode === 12 || lineCode === 13) {
                subParts = subParts[5]
                  .trim()
                  .explode(' ',5);

                if (subParts && subParts.length === 5) {
                  navaid.bias = parseFloat(subParts[0]);
                  navaid.identifier = subParts[1];
                  navaid.icao = subParts[2];
                  navaid.runwayNumber = subParts[3];
                  navaid.name = subParts[4];
                }
              }
            }

            navaids.push(navaid);
          }
        }

        if (lineCode === 99) eof = true;
      } else eof = true;
    }

    return navaids;
  }

  parser.parseFixes = function (file)
  {
    var frd = new FileLineReader(file);

    var eof = false;
    var line = null;
    var lineParts = null;
    var subParts = null;
    var lineCode = null;
    var fix = null;
    var fixes = [];
    var id = 0;

    // skip first 3 lines, as those contain the header
    if (frd.hasNextLine()) frd.nextLine(); else return fixes;
    if (frd.hasNextLine()) frd.nextLine(); else return fixes;
    if (frd.hasNextLine()) frd.nextLine(); else return fixes;

    while(!eof) {
      if (frd.hasNextLine()) {
        // remove duplicate whitespaces from line for better parsing
        line = removeDuplicateWhitespace(frd.nextLine());

        // only one character wich is new line, so fixes will start next
        if (line.length === 1) {
          lineCode = -1;
        } else if (line.trim() === '99') { // end of file
          lineCode = 99;
        }

        // fix found
        if (lineCode!== 99 && lineCode !== -1) {
          fix = Fix();
          id++;
          fix.id = id;

          subParts = line
            .trim()
            .explode(' ',3);

          if (subParts && subParts.length === 3) {
            fix.lat = parseFloat(subParts[0]);
            fix.lon = parseFloat(subParts[1]);
            fix.name = subParts[2];
          }

          fixes.push(fix);
        }

        if (lineCode === 99) eof = true;
      } else eof = true;
    }

    return fixes;
  };

  parser.parseAirways = function (file)
  {
    var frd = new FileLineReader(file);

    var eof = false;
    var line = null;
    var lineParts = null;
    var subParts = null;
    var lineCode = null;
    var airway = null;
    var airways = [];
    var id = 0;

    // skip first 3 lines, as those contain the header
    if (frd.hasNextLine()) frd.nextLine(); else return fixes;
    if (frd.hasNextLine()) frd.nextLine(); else return fixes;
    if (frd.hasNextLine()) frd.nextLine(); else return fixes;

    while (!eof) {
      if (frd.hasNextLine()) {
        // remove duplicate whitespaces from line for better parsing
        line = removeDuplicateWhitespace(frd.nextLine());

        // only one character wich is new line, so fixes will start next
        if (line.length === 1) {
          lineCode = -1;
        } else if (line.trim() === '99') { // end of file
          lineCode = 99;
        }

        // airway found
        if (lineCode !== 99 && lineCode !== -1) {
          airway = Airway();
          id++;
          airway.id = id;

          subParts = line
            .trim()
            .explode(' ', 10);

          if (subParts && subParts.length === 10) {
             airway.fromName = subParts[0].trim();
             airway.fromLat = parseFloat(subParts[1].trim());
             airway.fromLon = parseFloat(subParts[2].trim());
             airway.toName = subParts[3].trim();
             airway.toLat = parseFloat(subParts[4].trim());
             airway.toLon = parseFloat(subParts[5].trim());
             airway.type = parseInt(subParts[6].trim());
             airway.elevationBase = parseInt(subParts[7].trim());
             airway.elevationTop = parseInt(subParts[8].trim());
             airway.name = subParts[9].trim();
          }

          airways.push(airway);
        }

        if (lineCode === 99) eof = true;
      } else eof = true;
    }

    return airways;
  };

  return parser;
};
