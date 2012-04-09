var FileLineReader = require('./file_line_reader').FileLineReader;
var Airport = require('./apt_nav_data').Airport;
var Runway = require('./apt_nav_data').Runway;
var Navaid = require('./apt_nav_data').Navaid;
var Fix = require('./apt_nav_data').Fix;
require('./string_utils');
//require('./estro');

exports.AptNavParser = function()
{
  this.parseInfo = function(file)
  {
    var frd = new FileLineReader(file);
    
    if(frd.hasNextLine()) {
      var line = frd.nextLine();
      if(line.trim()=='I');
      if(frd.hasNextLine()) {
        line = frd.nextLine();
        var info = line.trim().explode('. ',2);
        info = info[0].trim().explode(', ',3);
        var format_version = parseInt(info[0].trim().explode(' - ',2)[0].replace('Version',''));
        var data_cycle = info[0].trim().explode(' - ',2)[1].trim().replace('data cycle ','');
        var build = parseInt(info[1].trim().replace('build ',''));
        var metadata = info[2].trim().replace('metadata ','');
        return {
          format_version:format_version,
          data_cycle:data_cycle,
          build:build,
          metadata:metadata
        }
      }
    }
    return null;
  }

  this.parseAirports = function(file)
  {
    var frd = new FileLineReader(file);
    
    var eof = false;
    var line = null;
    var line_parts = null;
    var sub_parts = null;
    var line_code = null;
    var airport = null;
    var runway = null;
    var communication = null;
    var airports = [];
    var airport_end = false;
    
    // skip first 3 lines, as those contain the header
    if(frd.hasNextLine()) frd.nextLine(); else return airports;
    if(frd.hasNextLine()) frd.nextLine(); else return airports;
    if(frd.hasNextLine()) frd.nextLine(); else return airports;
    
    while(!eof) {
      if(frd.hasNextLine()) {
        line = frd.nextLine().replace(/\s+/g, " "); // remove duplicate whitespaces from line for better parsing
        
        if(line.length==1) { // only one character wich is new line, so airport ended
          airport_end = true;
          line_code = 0;
        } else { // something else
          airport_end = false;
          line_parts = line.explode(' ',2);
          line_code = parseInt(line_parts[0]);
        }        
        
        if(line_code!=99) {
          // airport started
          if(line_code==1 || line_code==16 || line_code==17) {
            airport_started = true;
            sub_parts = line_parts[1].trim().explode(' ',5);

            if(sub_parts && sub_parts.length==5) {          
              airport = new Airport();
              airport.type = line_code;
              airport.elevation = parseInt(sub_parts[0]);
              airport.tower = (parseInt(sub_parts[1])==1)?true:false;
              airport.icao = sub_parts[3];
              airport.name = sub_parts[4];
              airport.runways = [];
            }           
          }  

          // runway started
          if(line_code==100 || line_code==101 || line_code==102) {
            runway = new Runway();

            // land runway
            if(line_code==100) {
              runway.type = line_code;

              sub_parts = line_parts[1].trim().explode(' ',8);            
              if(sub_parts && sub_parts.length==8) {
                runway.width = parseFloat(sub_parts[0]);
                runway.surface_type = parseInt(sub_parts[1]);

                // runway start
                sub_parts = sub_parts[7].trim().explode(' ',10);
                if(sub_parts && sub_parts.length==10) {
                  runway.number_start = sub_parts[0];
                  runway.lat_start = parseFloat(sub_parts[1]);
                  runway.lon_start = parseFloat(sub_parts[2]);
                }

                // runway end
                sub_parts = sub_parts[9].trim().explode(' ',9);
                if(sub_parts && sub_parts.length==9) {
                  runway.number_end = sub_parts[0];
                  runway.lat_end = parseFloat(sub_parts[1]);
                  runway.lon_end = parseFloat(sub_parts[2]);
                }
              }
            }

            // water runway
            if(line_code==101) {
              runway.type = line_code;
              sub_parts = line_parts[1].trim().explode(' ',3);
              if(sub_parts && sub_parts.length==3) {
                runway.width = parseFloat(sub_parts[0]);

                // runway start
                sub_parts = sub_parts[2].trim().explode(' ',4);
                if(sub_parts && sub_parts.length==4) {
                  runway.number_start = sub_parts[0];
                  runway.lat_start = parseFloat(sub_parts[1]);
                  runway.lon_start = parseFloat(sub_parts[2]);
                }

                // runway end
                sub_parts = sub_parts[3].trim().explode(' ',3);
                if(sub_parts && sub_parts.length==3) {
                  runway.number_end = sub_parts[0];
                  runway.lat_end = parseFloat(sub_parts[1]);
                  runway.lon_end = parseFloat(sub_parts[2]);
                }
              }
            }

            // helipad runway
            if(line_code==102) {
              runway.type = line_code;
              sub_parts = line_parts[1].trim().explode(' ',11);
              if(sub_parts && sub_parts.length==11) {
                runway.surface_type = parseInt(sub_parts[6]);
                runway.length = parseFloat(sub_parts[4]);
                runway.width = parseFloat(sub_parts[5]);

                // runway start
                runway.number_start = sub_parts[0];
                runway.lat_start = parseFloat(sub_parts[1]);
                runway.lon_start = parseFloat(sub_parts[2]);
              }
            }

            // add runway to airport
            if(airport) airport.runways.push(runway);
          }

          // communication started
          if(line_code>=50 && line_code<=56) {
            communication = new Communication();

            communication.type = line_code;
            sub_parts = line_parts[1].trim().explode(' ',2);
            if(sub_parts && sub_parts.length==2) {
              communication.frequency = parseInt(sub_parts[0]);
              communication.name = sub_parts[1];
            }

            if(airport) airport.communications.push(communication);
          }

          if(airport_end && airport) {
            airport.calcLatLon();
            airports.push(airport);
            //console.log('Found airport: '+airport.icao+' - '+airport.name);
          }
        }
        
        if(line_code==99) eof = true;
      } else eof = true;
    }
    return airports;
  }
  
  this.parseNavaids = function(file)
  {
    var frd = new FileLineReader(file);
    
    var eof = false;
    var line = null;
    var line_parts = null;
    var sub_parts = null;
    var line_code = null;
    var navaid = null;
    var navaids = [];
    var id = 0;
    
    // skip first 3 lines, as those contain the header
    if(frd.hasNextLine()) frd.nextLine(); else return navaids;
    if(frd.hasNextLine()) frd.nextLine(); else return navaids;
    if(frd.hasNextLine()) frd.nextLine(); else return navaids;
    
    while(!eof) {
      if(frd.hasNextLine()) {
        line = frd.nextLine().replace(/\s+/g, " "); // remove duplicate whitespaces from line for better parsing
        
        if(line.length==1) { // only one character wich is new line
          line_code = 0;
        } else { // something else
          line_parts = line.explode(' ',2);
          line_code = parseInt(line_parts[0]);
        }        
        
        if(line_code!=99) {
          // navaid found
          if((line_code>=2 && line_code<=9) || (line_code>=12 && line_code<=13)) {
            navaid = new Navaid();
            id++;
            navaid.id = id;
            navaid.type = line_code;

            sub_parts = line_parts[1].trim().explode(' ',6);

            if(sub_parts && sub_parts.length==6) {
              navaid.lat = parseFloat(sub_parts[0]);
              navaid.lon = parseFloat(sub_parts[1]);
              navaid.elevation = parseInt(sub_parts[2]);
              navaid.frequency = parseInt(sub_parts[3]);
              navaid.range = parseInt(sub_parts[4]);

              // NDB
              if(line_code==2) {
                sub_parts = sub_parts[5].trim().explode(' ',3);
                if(sub_parts && sub_parts.length==3) {
                  navaid.identifier = sub_parts[1];
                  navaid.name = sub_parts[2];
                }
              }

              // VOR
              if(line_code==3) {
                sub_parts = sub_parts[5].trim().explode(' ',3);
                if(sub_parts && sub_parts.length==3) {
                  navaid.variation = parseFloat(sub_parts[0]);
                  navaid.identifier = sub_parts[1];
                  navaid.name = sub_parts[2];
                }
              }

              // LOC or Glideslope
              if(line_code>=4 && line_code<=6) {
                sub_parts = sub_parts[5].trim().explode(' ',5);
                if(sub_parts && sub_parts.length==5) {
                  navaid.bearing = parseFloat(sub_parts[0]);
                  navaid.identifier = sub_parts[1];
                  navaid.icao = sub_parts[2];
                  navaid.runway_number = sub_parts[3];
                  navaid.name = sub_parts[4];
                }
              }

              // Marker beacons
              if(line_code>=7 && line_code<=9) {
                sub_parts = sub_parts[5].trim().explode(' ',5);
                if(sub_parts && sub_parts.length==5) {
                  navaid.bearing = parseFloat(sub_parts[0]);
                  navaid.icao = sub_parts[2];
                  navaid.runway_number = sub_parts[3];
                  navaid.name = sub_parts[4];
                }
              }

              // DME
              if(line_code==12 || line_code==13) {
                sub_parts = sub_parts[5].trim().explode(' ',5);
                if(sub_parts && sub_parts.length==5) {
                  navaid.bias = parseFloat(sub_parts[0]);
                  navaid.identifier = sub_parts[1];
                  navaid.icao = sub_parts[2];
                  navaid.runway_number = sub_parts[3];
                  navaid.name = sub_parts[4];
                }
              }
            }

            navaids.push(navaid);
          }
        }
        
        if(line_code==99) eof = true;
      } else eof = true;
    }
    return navaids;
  }
  
  this.parseFixes = function(file)
  {
    var frd = new FileLineReader(file);
    
    var eof = false;
    var line = null;
    var line_parts = null;
    var sub_parts = null;
    var line_code = null;
    var fix = null;
    var fixes = [];
    var id = 0;
    
    // skip first 3 lines, as those contain the header
    if(frd.hasNextLine()) frd.nextLine(); else return fixes;
    if(frd.hasNextLine()) frd.nextLine(); else return fixes;
    if(frd.hasNextLine()) frd.nextLine(); else return fixes;
    
    while(!eof) {
      if(frd.hasNextLine()) {
        line = frd.nextLine().replace(/\s+/g, " "); // remove duplicate whitespaces from line for better parsing
        
        if(line.length==1) { // only one character wich is new line, so fixes will start next
          line_code = -1;
        } else if(line.trim()=='99') { // end of file
          line_code = 99;
        }        
        
        // fix found
        if(line_code!=99 && line_code!=-1) {
          fix = new Fix();
          id++;
          fix.id = id;
          
          sub_parts = line.trim().explode(' ',3);
          
          if(sub_parts && sub_parts.length==3) {
            fix.lat = parseFloat(sub_parts[0]);
            fix.lon = parseFloat(sub_parts[1]);
            fix.name = sub_parts[2];
          }
        
          fixes.push(fix);
        }
        
        if(line_code==99) eof = true;
      } else eof = true;
    }
    return fixes;
  };
  
  this.parseAirways = function(file)
  {
    var frd = new FileLineReader(file);
    
    var eof = false;
    var line = null;
    var line_parts = null;
    var sub_parts = null;
    var line_code = null;
    var airway = null;
    var airways = [];
    var id = 0;
    
    // skip first 3 lines, as those contain the header
    if(frd.hasNextLine()) frd.nextLine(); else return fixes;
    if(frd.hasNextLine()) frd.nextLine(); else return fixes;
    if(frd.hasNextLine()) frd.nextLine(); else return fixes;
    
    while(!eof) {
      if(frd.hasNextLine()) {
        line = frd.nextLine().replace(/\s+/g, " "); // remove duplicate whitespaces from line for better parsing
        
        if(line.length==1) { // only one character wich is new line, so fixes will start next
          line_code = -1;
        } else if(line.trim()=='99') { // end of file
          line_code = 99;
        }
        
        // airway found
        if(line_code!=99 && line_code!=-1) {
          airway = new Airway();
          id++;
          airway.id = id;
          
          sub_parts = line.trim().explode(' ',10);
          
          if(sub_parts && sub_parts.length==10) {
             airway.from_name = sub_parts[0].trim();
             airway.from_lat = parseFloat(sub_parts[1].trim());
             airway.from_lon = parseFloat(sub_parts[2].trim());
             airway.to_name = sub_parts[3].trim();
             airway.to_lat = parseFloat(sub_parts[4].trim());
             airway.to_lon = parseFloat(sub_parts[5].trim());
             airway.type = parseInt(sub_parts[6].trim());
             airway.elevation_base = parseInt(sub_parts[7].trim());
             airway.elevation_top = parseInt(sub_parts[8].trim());
             airway.name = sub_parts[9].trim();
          }
          
          airways.push(airway);
        }
        
        if(line_code==99) eof = true;
      } else eof = true;
    }
    return airways;
  };
}