var FileLineReader = require('./file_line_reader').FileLineReader;
var Airport = require('./apt_nav_data').Airport;
require('./string_utils');
//require('./estro');

exports.AptNavParser = function()
{  
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
    var airports = [];
    var lats = [];
    var lons = [];
    
    while(!eof) {
      if(frd.hasNextLine()) {
        line = frd.nextLine();
        
        line_parts = line.explode(' ',2);
        line_code = parseInt(line_parts[0]);
        
        // airport started
        if(line_code==1 || line_code==16 || line_code==17) {
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
          
          // runway started
          if(line_code==100 || line_code==101 || line_code==102) {
            runway = new Airport.Runway();
            
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
                  runway.lat_start = floatVal(sub_parts[1]);
                  runway.lon_start = floatVal(sub_parts[2]);
                }
                
                // runway end
                sub_parts = sub_parts[10].trim().explode(' ',9);
                if(sub_parts && sub_parts.length==9) {
                  runway.number_end = sub_parts[0];
                  runway.lat_end = floatVal(sub_parts[1]);
                  runway.lon_end = floatVal(sub_parts[2]);
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
                sub_parts = sub_parts[3].trim().explode(' ',4);
                if(sub_parts && sub_parts.length==4) {
                  runway.number_start = sub_parts[0];
                  runway.lat_start = floatVal(sub_parts[1]);
                  runway.lon_start = floatVal(sub_parts[2]);
                }
                
                // runway end
                sub_parts = sub_parts[4].trim().explode(' ',3);
                if(sub_parts && sub_parts.length==3) {
                  runway.number_end = sub_parts[0];
                  runway.lat_end = floatVal(sub_parts[1]);
                  runway.lon_end = floatVal(sub_parts[2]);
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
                runway.lat_start = floatVal(sub_parts[1]);
                runway.lon_start = floatVal(sub_parts[2]);
              }
            }
            
            // add runway to airport
            airport.runways.push(runway);
          }
          
          if(airport) {
            airport.calcLatLon();
            airports.push(airport);
            console.log('Found airport: '+airport.icao+' - '+airport.name);
          }
        }
        
        if(line_code==99) eof = true;
      } else eof = true;
    }
    return airports;
  }
}