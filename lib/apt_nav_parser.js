var FileLineReader = require('./file_line_reader').FileLineReader;
var Airport = require('./apt_nav_data').Airport;
var Runway = require('./apt_nav_data').Runway;
var Navaid = require('./apt_nav_data').Navaid;
var Fix = require('./apt_nav_data').Fix;
require('./string_utils');
//require('./estro');

exports.AptNavParser = function()
{
  this.airportsInfo = function(file)
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
    var lats = [];
    var lons = [];
    var airport_end = false;
    
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
        
        if(line_code==99) eof = true;
      } else eof = true;
    }
    return airports;
  }
}