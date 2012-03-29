var app = require('../app');
var AptNavData = require('../lib/apt_nav_data').AptNavData;


function zeroFill( number, width )
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number;
}

function numberRounded(number,decimals)
{
  var d = decimals*10;
  return Math.round(number*d)/d;
}

FmsExporter = function()
{
  this.fromRoute = function(route,callback)
  {
    this.route = route;
    this.out = '';
    this.current_waypoint = 0;
    this.aptNavData = new AptNavData(app.db);
    
    // header
    this.out+="I\n"
        +"3 version\n"
        +"1\n"
        +(this.route.waypoints.length-1)+"\n";
    
    this.addNextWaypoint(callback);
  };
  
  this.addNextWaypoint = function(callback)
  {
    if(this.current_waypoint<this.route.waypoints.length) {
      var _this = this;
      var name = null;
      var elevation = 0;
      var type_num = 28;
      var waypoint = this.route.waypoints[this.current_waypoint];
      this.current_waypoint++;

      switch(waypoint.type) {
        case 'airport':
          this.aptNavData.findAirportByIcao(waypoint.apt_nav_id,function(airport){
            name = airport.icao;
            elevation = airport.elevation;
            type_num = 1;
            
            _this.out+=type_num+" "+name+" "+elevation.toFixed(6)+" "+waypoint.lat.toFixed(6)+" "+waypoint.lon.toFixed(6)+"\n";
            _this.addNextWaypoint(callback);
          });        
          break;
        
        case 'navaid':
          this.aptNavData.findNavaidById(waypoint.apt_nav_id,function(navaid){
            name = navaid.identifier;
            elevation = navaid.elevation;
            if(navaid.type==2) {
              type_num = 2;
            } else if(navaid.type==3) {
              type_num = 3;
            } else type_num = 28;
            
            _this.out+=type_num+" "+name+" "+elevation.toFixed(6)+" "+waypoint.lat.toFixed(6)+" "+waypoint.lon.toFixed(6)+"\n";
            _this.addNextWaypoint(callback);
          });        
          break;
        
        case 'fix':
          this.aptNavData.findFixById(waypoint.apt_nav_id,function(fix){
            name = fix.name;
            type_num = 11;
            
            _this.out+=type_num+" "+name+" "+elevation.toFixed(6)+" "+waypoint.lat.toFixed(6)+" "+waypoint.lon.toFixed(6)+"\n";
            _this.addNextWaypoint(callback);
          });        
          break;
        
        case 'gps':
          name = this.getLatLonName(waypoint.lat,waypoint.lon);
          type_num = 28;
          
          this.out+=type_num+" "+name+" "+elevation.toFixed(6)+" "+waypoint.lat.toFixed(6)+" "+waypoint.lon.toFixed(6)+"\n";
          this.addNextWaypoint(callback);
          break;
        
        default:
          name = this.getLatLonName(waypoint.lat,waypoint.lon);
          type_num = 28;
          
          this.out+=type_num+" "+name+" "+elevation.toFixed(6)+" "+waypoint.lat.toFixed(6)+" "+waypoint.lon.toFixed(6)+"\n";
          this.addNextWaypoint(callback);
      }
    } else {
      callback(this.out);
    }
  };
  
  this.getLatLonName = function(lat,lon)
  {
    var out = '';
    if(lat>=0) out+='+'; else out+='-';
    out+=zeroFill(lat.toFixed(3),3);
    out+='_';
    if(lon>=0) out+='+'; else out+='-';
    out+=zeroFill(lon.toFixed(3),3);
    return out;
  }
}

exports.FmsExporter = FmsExporter;