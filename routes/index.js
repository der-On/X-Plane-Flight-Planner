var AptNavData = require('../lib/apt_nav_data').AptNavData;
var AptNavParser = require('../lib/apt_nav_parser').AptNavParser;

/*
 * GET home page.
 */

exports.index = function(req, res){
  var aptNavData = new AptNavData();
  aptNavData.getVariable('airports_info',function(airports_info){
    aptNavData.getVariable('navaids_info',function(navaids_info){
      aptNavData.getVariable('fixes_info',function(fixes_info){
        res.render('index', { title: 'X-Plane Flight Planner', apt_nav_info: { airports: airports_info, navaids: navaids_info, fixes: fixes_info }});
      });
    });    
  });
};

exports.importing = function(req,res) {
  var aptNavData = new AptNavData();
  aptNavData.getVariable('airports_info',function(airports_info){
    aptNavData.getVariable('navaids_info',function(navaids_info){
      aptNavData.getVariable('fixes_info',function(fixes_info){
        res.render('import', { title: 'X-Plane Flight Planner - Import', apt_nav_info: { airports: airports_info, navaids: navaids_info, fixes: fixes_info }});
      });
    });    
  });
}

exports.importAirports = function(req,res){
  var aptNavData = new AptNavData();
  var aptNavParser = new AptNavParser();
  var airports_info = aptNavParser.parseInfo('apt_nav/apt.dat');
  var airports = aptNavParser.parseAirports('apt_nav/apt.dat');
  
  aptNavData.clearAirports();
  aptNavData.saveAirports(airports);
  aptNavData.clearVariable('airports_info');
  aptNavData.saveVariable('airports_info',airports_info);
  
  aptNavData.getVariable('navaids_info',function(navaids_info){
    aptNavData.getVariable('fixes_info',function(fixes_info){
      res.render('import_airports', { title: 'X-Plane Flight Planner - Import airports', airports: airports, apt_nav_info: { airports: airports_info, navaids: navaids_info, fixes: fixes_info }});
    });
  });
};

exports.importNavaids = function(req,res){
  var aptNavData = new AptNavData();
  var aptNavParser = new AptNavParser();
  var navaids = aptNavParser.parseNavaids('apt_nav/earth_nav.dat');
  var navaids_info = aptNavParser.parseInfo('apt_nav/earth_nav.dat');
  
  aptNavData.clearNavaids();
  aptNavData.saveNavaids(navaids);
  aptNavData.clearVariable('navaids_info');
  aptNavData.saveVariable('navaids_info',navaids_info);
  
  aptNavData.getVariable('airports_info',function(airports_info){
    aptNavData.getVariable('fixes_info',function(fixes_info){
      res.render('import_navaids', { title: 'X-Plane Flight Planner - Import navaids', navaids: navaids, apt_nav_info: { airports: airports_info, navaids: navaids_info, fixes: fixes_info }});
    });
  });
};

exports.importFixes = function(req,res){
  var aptNavData = new AptNavData();
  var aptNavParser = new AptNavParser();
  var fixes = aptNavParser.parseFixes('apt_nav/earth_fix.dat');
  var fixes_info = aptNavParser.parseInfo('apt_nav/earth_fix.dat');
  
  aptNavData.clearFixes();
  aptNavData.saveFixes(fixes);
  aptNavData.clearVariable('fixes_info');
  aptNavData.saveVariable('fixes_info',fixes_info);
  
  aptNavData.getVariable('airports_info',function(airports_info){
    aptNavData.getVariable('navaids_info',function(navaids_info){
      res.render('import_fixes', { title: 'X-Plane Flight Planner - Import fixes', fixes: fixes, apt_nav_info: { airports: airports_info, navaids: navaids_info, fixes: fixes_info }});
    });
  });
};

exports.aptNavJson = function(req,res) {
  var aptNavData = new AptNavData();
  
  var bounds = req.param('bounds').split(',');
  
  var left = parseFloat(bounds[0]);
  var bottom = parseFloat(bounds[1]);
  var right = parseFloat(bounds[2]);
  var top = parseFloat(bounds[3]);
  
  var airports = [];
  var navaids = [];
  var fixes = [];
  
  aptNavData.findAirportsInBounds(left,bottom,right,top,function(airports){
    res.json({bounds:{left:left,top:top,right:right,bottom:bottom},airports:airports,navaids:navaids,fixes:fixes});
  });
}

exports.airportJson = function(req,res) {
  var aptNavData = new AptNavData();
  aptNavData.findAirportByIcao(req.params.icao,function(airport){
    res.json({airport:airport});
  });
}

exports.airportsSearchJson = function(req,res) {
  var aptNavData = new AptNavData();
  aptNavData.findAirportsMatching(req.params.search,function(airports){
    res.json({airports:airports});
  });
}