
//.collection('blog').find().toArray(function(err, items){
//    console.dir(items);
//});

exports.AptNavData = function()
{
  this.mongo = require('mongoskin');
  this.db = this.mongo.db('localhost:27017/x-plane_apt_nav');
  
  this.clearAirports = function(callback)
  {
    var collection = this.db.collection('airports');
    collection.remove({},callback);
  };
  
  this.saveAirports = function(airports, callback)
  {
    var collection = this.db.collection('airports');
    for(var i = 0; i<airports.length;i++) {
      collection.insert(airports[i].getDataObject(),callback);
    }
  };
  
  this.findAirportByIcao = function(icao, callback) {
    var collection = this.db.collection('airports');
    var airport = collection.findOne({icao:icao});
    console.log(airport);
    if(airport) {
      if(callback) callback(airport);
    }
  };
}

exports.Airport = function()
{
  this.type = null;
  this.icao = null;
  this.lat = null;
  this.lon = null;
  this.communication = [];
  this.elevation = null;
  this.tower = false;
  this.name = null;
  this.runways = [];
  
  this.getTypeName = function()
  {
    switch(this.type_num) {
      case 1: return 'Airport'; break;
      case 2: return 'Seaport'; break;
      case 3: return 'Heliport'; break;
      default: return null;
    }
  };
  
  this.calcLatLon = function()
  {
    var lat = 0;
    var lon = 0;
    for(var i = 0;i<this.runways.length;i++) {
      lat+=runways[i].lat_start + runways[i].lat_end;
      lon+=runways[i].lon_start + runways[i].lon_end;
    }
    this.lat = lat/(this.runways.length*2);
    this.lon = lat/(this.runways.length*2);
  };
  
  this.getDataObject = function()
  {
    return {
      icao:this.icao,
      name:this.name,
      lat: this.lat,
      lon: this.lon,
      communication: this.communication,
      elevation: this.elevation,
      tower: this.tower,
      type: this.type,
      runways: this.runways
    };
  };
  
  this.Runway = function()
  {
    this.type = null;
    this.width = null;
    this.surface_type = null;
    this.number_start = null;
    this.number_end = null;
    this.lat_start = null;
    this.lon_start = null;
    this.lat_end = null;
    this.lon_end = null;
    this.length = null;
    
    this.getTypeName = function()
    {
      switch(this.type) {
        case 100: return 'Land Runway'; break;
        case 101: return 'Water Runway'; break;
        case 102: return 'Helipad'; break;
        default: return null;
      }
    };
    
    this.getSurfaceTypeName = function()
    {
      switch(this.surface_type) {
        default: return null;
      }
    };
  }
}

exports.Navaid = function()
{
  
}

exports.Fix = function()
{
  
}
