AptNavData = function()
{
  this.mongo = require('mongoskin');
  this.db = this.mongo.db('localhost:27017/x-plane_apt_nav');
  
  this.clearCollection = function(name,callback)
  {
    var collection = this.db.collection(name);
    collection.remove({},callback);
  };
  
  this.saveCollection = function(name,data, callback)
  {
    var collection = this.db.collection(name);
    for(var i = 0; i<data.length;i++) {
      collection.insert(data[i].getDataObject(),callback);
    }
  };
  
  this.getCollectionTotalCount = function(name)
  {
    var collection = this.db.collection(name);
    return collection.count();
  };
  
  this.findCollectionInBounds = function(name,left,top,right,bottom,callback)
  {
    var collection = this.db.collection(name);
    airports_data = collection.findItems({lat:{$gte:top,$lte:bottom},lon:{$gte:left,$lte:right}},function(error,results){
      if(callback) callback(results);
    });
  };
  
  this.clearAirports = function(callback)
  {
    this.clearCollection('airports',callback);
  };
  
  this.saveAirports = function(airports, callback)
  {
    this.saveCollection('airports',airports,callback);
  };
  
  this.findAirportByIcao = function(icao, callback) {
    var collection = this.db.collection('airports');
    collection.findOne({icao:icao},function(error,result){
      var airport = new Airport(result);
      if(callback) callback(airport);
    });
  };
  
  this.findAirportsInBounds = function(left,top,right,bottom,callback)
  {
    this.findCollectionInBounds('airports',left,top,right,bottom,function(results){
      var airports = [];
      for(var i = 0;i<results.length;i++) {
        airports.push(new Airport(results[i]));
      }
      if(callback) callback(airports);
    });
  };
  
  this.getAirportsTotalCount = function()
  {
    return this.getCollectionTotalCount('airports');
  };
  
  this.findAirportsMatching = function(search,callback)
  {
    var collection = this.db.collection('airports');
    var regexp = new RegExp('^'+search);
    collection.findItems({$or:[{icao:regexp},{name:regexp}]},function(error,results){
      results.sort({icao:1});
      var airport = new Airport(results);
      var airports = [];
      for(var i = 0;i<results.length;i++) {
        airports.push(new Airport(results[i]));
      }
      if(callback) callback(airports);
    });
  }
  
  this.clearNavaids = function(callback)
  {
    this.clearCollection('navaids',callback);
  };
  
  this.saveNavaids = function(navaids, callback)
  {
    this.saveCollection('navaids',navaids,callback);
  };
  
  this.findNavaidById = function(id, callback) {
    var collection = this.db.collection('navaids');
    collection.findOne({id:id},function(error,result){
      var navaid = new Navaid(result);
      if(callback) callback(navaid);
    });
  };
  
  this.findNavaidsInBounds = function(left,top,right,bottom,callback)
  {
    this.findCollectionInBounds('navaids',left,top,right,bottom,function(results){
      var navaids = [];
      for(var i = 0;i<results.length;i++) {
        navaids.push(new Navaid(results[i]));
      }
      if(callback) callback(navaids);
    });
  };
  
  this.clearFixes = function(callback)
  {
    this.clearCollection('fixes',callback);
  };
  
  this.saveFixes = function(fixes, callback)
  {
    this.saveCollection('fixes',fixes,callback);
  };
  
  this.findFixById = function(id, callback) {
    var collection = this.db.collection('fixes');
    collection.findOne({id:id},function(error,result){
      var fix = new Fix(result);
      if(callback) callback(fix);
    });
  };
  
  this.findFixesInBounds = function(left,top,right,bottom,callback)
  {
    this.findCollectionInBounds('fixes',left,top,right,bottom,function(results){
      var fixes = [];
      for(var i = 0;i<results.length;i++) {
        fixes.push(new Fix(results[i]));
      }
      if(callback) callback(fixes);
    });
  };
  
  this.saveVariable = function(name,value, callback)
  {
    var collection = this.db.collection('variables');
    collection.insert({name:name,value:value},callback);
  };
  
  this.getVariable = function(name,callback)
  {
    var collection = this.db.collection('variables');
    collection.findOne({name:name},function(error,result){
      if(callback) {
        if(result) {
          callback(result.value);
        } else callback(result);
      }
    });
  };
  
  this.clearVariable = function(name,callback)
  {
    var collection = this.db.collection('variables');
    collection.remove({name:name},callback);
  };
}
exports.AptNavData = AptNavData;

Airport = function(data)
{
  this.type = null;
  this.icao = null;
  this.lat = 0;
  this.lon = 0;
  this.communications = [];
  this.elevation = 0;
  this.tower = false;
  this.name = null;
  this.runways = [];
  
  if(data && typeof data == 'object') {
    if(data.type) this.type = data.type;
    if(data.icao) this.icao = data.icao;
    if(data.lat) this.lat = data.lat;
    if(data.lon) this.lon = data.lon;
    if(data.communications) {
      for(var i=0;i<data.communications.length;i++) {
        this.communications.push(new Communication(data.communications[i]));
      }      
    }
    if(data.elevation) this.elevation = data.elevation;
    if(data.tower) this.tower = data.tower;
    if(data.name) this.name = data.name;
    if(data.runways) {
      for(var i =0;i<data.runways.length;i++) {
        this.runways.push(new Runway(data.runways[i]));
      }
    }
  }
  
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
    var _lat = null;
    var _lon = null;
    var count = 0;
    
    for(var i = 0;i<this.runways.length;i++) {
      _lat = null;
      _lon = null;
      
      // prevent inclusino of null lat/lon
      if(this.runways[i].lat_start!==null) {
        _lat = this.runways[i].lat_start;
        if(this.runways[i].lat_end!==null) {
          _lat+= this.runways[i].lat_end;
          _lat = _lat/2;
        }
      }
      
      // prevent inclusino of null lat/lon
      if(this.runways[i].lon_start!==null) {
        _lon = this.runways[i].lon_start;
        if(this.runways[i].lon_end!==null) {
          _lon+= this.runways[i].lon_end;
          _lon = _lon/2;
        }
      }      
      
      // prevent inclusino of null lat/lon
      if(_lat!==null && _lon!==null) {
         lat+=_lat;
         lon+=_lon;
         count++;
      }
      
    }
    if(count!==0) {
      this.lat = lat/count;
      this.lon = lon/count;
    }
  };
  
  this.getDataObject = function()
  {
    var r = {
      icao:this.icao,
      name:this.name,
      lat: this.lat,
      lon: this.lon,
      communications: this.communications,
      elevation: this.elevation,
      tower: this.tower,
      type: this.type,
      runways: []
    };
    for(var i=0;i<this.runways.length;i++) {
      r.runways.push(this.runways[i].getDataObject());
    }
    return r;
  }; 
}
exports.Airport = Airport;

Runway = function(data)
{
  this.type = null;
  this.width = 0;
  this.surface_type = null;
  this.number_start = null;
  this.number_end = null;
  this.lat_start = 0;
  this.lon_start = 0;
  this.lat_end = 0;
  this.lon_end = 0;
  this.length = 0;

  if(data && typeof data == 'object') {
    if(data.type) this.type = data.type;
    if(data.width) this.width = data.width;
    if(data.surface_type) this.surface_type = data.surface_type;
    if(data.number_start) this.number_start = data.number_start;
    if(data.number_end) this.number_end = data.number_end;
    if(data.lat_start) this.lat_start = data.lat_start;
    if(data.lon_start) this.lon_start = data.lon_start;
    if(data.lat_end) this.lat_start = data.lat_end;
    if(data.lon_end) this.lon_start = data.lon_end;
    if(data.length) this.length = data.length;
  };

  this.getTypeName = function()
  {
    switch(this.type) {
      case 100: return 'Land Runway'; break;
      case 101: return 'Water Runway'; break;
      case 102: return 'Helipad'; break;
      default: return null;
    }
  };

  this.getDataObject = function()
  {
    return {
      type: this.type,
      width: this.width,
      surface_type: this.surface_type,
      number_start: this.number_start,
      number_end: this.number_end,
      lat_start: this.lat_start,
      lon_start: this.lon_start,
      lat_end: this.lat_end,
      lon_end: this.lon_end,
      length: this.length
    };
  }

  this.getSurfaceTypeName = function()
  {
    switch(this.surface_type) {
      default: return null;
    }
  };
}
exports.Runway = Runway;

Communication = function(data)
{
  this.type = null;
  this.frequency = null;
  this.name = null;
  
  if(data && typeof data == 'object') {
    this.type = data.type;
    this.frequency = data.frequency;
    this.name = data.name;
  }
  
  this.getDataObject = function()
  {
    return {
      type:this.type,
      frequency:this.frequency,
      name:this.name
    };
  };
  
  this.getTypeName = function()
  {
    switch(this.type) {
      case 50: return 'Recorded'; break;
      case 51: return 'Unicorn'; break;
      case 52: return 'CLD'; break;
      case 53: return 'GND'; break;
      case 54: return 'TWR'; break;
      case 55: return 'APP'; break;
      case 56: return 'DEP'; break;
      default: return '';
    }
  };
}

Navaid = function(data)
{
  this.id = null;
  this.type = null;
  this.lat = 0;
  this.lon = 0;
  this.elevation = 0;
  this.frequency = 0;
  this.range = 0;
  this.icao = null;
  this.identifier = null;
  this.runway_number = null;
  this.name = null;
  this.variation = null;
  this.bearing = 0;
  this.bias = 0;
  
  if(data && typeof data == 'object') {
    if(data.id) this.id = data.id;
    if(data.type) this.type = data.type;
    if(data.lat) this.lat = data.lat;
    if(data.lon) this.lon = data.lon;
    if(data.elevation) this.elevation = data.elevation;
    if(data.frequency) this.frequency = data.frequency;
    if(data.range) this.range = data.range;
    if(data.icao) this.icao = data.icao;
    if(data.identifier) this.identifier = data.identifier;
    if(data.runway_number) this.runway_number = data.runmway_number;
    if(data.name) this.name = data.name;
    if(data.variation) this.variation = data.variation;
    if(data.bearing) this.bearing = data.bearing;
    if(data.bias) this.bias = data.bias;
  }
  
  this.getTypeName = function()
  {
    switch(this.type) {
      case 2: return 'NDB'; break;
      case 3: return 'VOR'; break;
      case 4: return 'LOC'; break;
      case 5: return 'LOC'; break;
      case 6: return 'Glideslope'; break;
      case 7: return 'OM'; break;
      case 8: return 'MM'; break;
      case 9: return 'IM'; break;
      case 12: return 'DME'; break;
      case 13: return 'DME'; break;
      default: return null;
    }
  }
  
  this.getDataObject = function()
  {
    return {
      id: this.id,
      type: this.type,
      lat: this.lat,
      lon: this.lon,
      elevation: this.elevation,
      frequency: this.frequency,
      range: this.range,
      icao: this.icao,
      identifier: this.identifier,
      runway_number: this.runway_number,
      name: this.name,
      variation: this.variation,
      bearing: this.bearing,
      bias: this.bias
    };
  }
}
exports.Navaid = Navaid;

Fix = function(data)
{
  this.lat = 0;
  this.lon = 0;
  this.name = null;
  this.id = null;
  
  if(data && typeof data == 'object') {
    if(data.id) this.id = data.id;
    if(data.lat) this.lat = data.lat;
    if(data.lon) this.lon = data.lon;
    if(data.name) this.name = data.name;
  }
  
  this.getDataObject = function()
  {
    return {
      id: this.id,
      lat: this.lat,
      lon: this.lon,
      name: this.name
    };
  }
}
exports.Fix = Fix;