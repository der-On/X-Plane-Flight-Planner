var AptNavData = require('../lib/apt_nav_data').AptNavData;
var AptNavParser = require('../lib/apt_nav_parser').AptNavParser;
var request = require('request');
var local_config = require('../local_config').config;
var app = require('../app');
var FmsExporter = require('../lib/fms_exporter').FmsExporter;

/*
 * GET home page.
 */

exports.index = function(req, res)
{
  var aptNavData = new AptNavData(app.db);
  aptNavData.getVariable('airports_info',function(airports_info){
    aptNavData.getVariable('navaids_info',function(navaids_info){
      aptNavData.getVariable('fixes_info',function(fixes_info){
        aptNavData.getVariable('airways_info',function(airways_info){
          res.render('index', {local_config: local_config, title: 'X-Plane Flight Planner', apt_nav_info: {airports: airports_info, navaids: navaids_info, fixes: fixes_info, airways: airways_info}});
        });
      });
    });    
  });
};

exports.importing = function(req,res)
{
  var aptNavData = new AptNavData(app.db);
  aptNavData.getVariable('airports_info',function(airports_info){
    aptNavData.getVariable('navaids_info',function(navaids_info){
      aptNavData.getVariable('fixes_info',function(fixes_info){
        aptNavData.getVariable('airways_info',function(airways_info){
          res.render('import', {local_config: local_config, title: 'X-Plane Flight Planner - Import', apt_nav_info: {airports: airports_info, navaids: navaids_info, fixes: fixes_info, airways: airways_info}});
        });
      });
    });    
  });
}

exports.importAirports = function(req,res)
{
  var aptNavData = new AptNavData(app.db);
  var aptNavParser = new AptNavParser();
  var airports_info = aptNavParser.parseInfo('apt_nav/apt.dat');
  var airports = aptNavParser.parseAirports('apt_nav/apt.dat');
  
  aptNavData.clearAirports();
  aptNavData.saveAirports(airports);
  aptNavData.clearVariable('airports_info');
  aptNavData.saveVariable('airports_info',airports_info);
  
  aptNavData.getVariable('navaids_info',function(navaids_info){
    aptNavData.getVariable('fixes_info',function(fixes_info){
      aptNavData.getVariable('airways_info',function(airways_info){
        res.render('import_airports', {local_config: local_config, title: 'X-Plane Flight Planner - Import airports', airports: airports, apt_nav_info: {airports: airports_info, navaids: navaids_info, fixes: fixes_info, airways: airways_info}});
      });
    });
  });
};

exports.importNavaids = function(req,res)
{
  var aptNavData = new AptNavData(app.db);
  var aptNavParser = new AptNavParser();
  var navaids = aptNavParser.parseNavaids('apt_nav/earth_nav.dat');
  var navaids_info = aptNavParser.parseInfo('apt_nav/earth_nav.dat');
  
  aptNavData.clearNavaids();
  aptNavData.saveNavaids(navaids);
  aptNavData.clearVariable('navaids_info');
  aptNavData.saveVariable('navaids_info',navaids_info);
  
  aptNavData.getVariable('airports_info',function(airports_info){
    aptNavData.getVariable('fixes_info',function(fixes_info){
      aptNavData.getVariable('airways_info',function(airways_info){
        res.render('import_navaids', {local_config: local_config, title: 'X-Plane Flight Planner - Import navaids', navaids: navaids, apt_nav_info: {airports: airports_info, navaids: navaids_info, fixes: fixes_info, airways: airways_info}});
      });
    });
  });
};

exports.importFixes = function(req,res)
{
  var aptNavData = new AptNavData(app.db);
  var aptNavParser = new AptNavParser();
  var fixes = aptNavParser.parseFixes('apt_nav/earth_fix.dat');
  var fixes_info = aptNavParser.parseInfo('apt_nav/earth_fix.dat');
  
  aptNavData.clearFixes();
  aptNavData.saveFixes(fixes);
  aptNavData.clearVariable('fixes_info');
  aptNavData.saveVariable('fixes_info',fixes_info);
  
  aptNavData.getVariable('airports_info',function(airports_info){
    aptNavData.getVariable('navaids_info',function(navaids_info){
      aptNavData.getVariable('fixes_info',function(fixes_info){
        aptNavData.getVariable('airways_info',function(airways_info){
          res.render('import_fixes', {local_config: local_config, title: 'X-Plane Flight Planner - Import fixes', fixes: fixes, apt_nav_info: {airports: airports_info, navaids: navaids_info, fixes: fixes_info, airways: airways_info}});
        });
      });
    });
  });
};

exports.importAirways = function(req,res)
{
  var aptNavData = new AptNavData(app.db);
  var aptNavParser = new AptNavParser();
  var airways = aptNavParser.parseAirways('apt_nav/earth_awy.dat');
  var airways_info = aptNavParser.parseInfo('apt_nav/earth_awy.dat');
  
  aptNavData.clearAirways();
  aptNavData.saveAirways(airways);
  aptNavData.clearVariable('airways_info');
  aptNavData.saveVariable('airways_info',airways_info);
  
  aptNavData.getVariable('airports_info',function(airports_info){
    aptNavData.getVariable('navaids_info',function(navaids_info){
      aptNavData.getVariable('fixes_info',function(fixes_info){
        aptNavData.getVariable('airways_info',function(airways_info){
          res.render('import_airways', {local_config: local_config, title: 'X-Plane Flight Planner - Import fixes', airways: airways, apt_nav_info: {airports: airports_info, navaids: navaids_info, fixes: fixes_info, airways: airways_info}});
        });
      });
    });
  });
};

exports.aptNavJson = function(req,res)
{
  var aptNavData = new AptNavData(app.db);
  
  var bounds = req.param('bounds').split(',');
  
  var left = parseFloat(bounds[0]);
  var bottom = parseFloat(bounds[1]);
  var right = parseFloat(bounds[2]);
  var top = parseFloat(bounds[3]);
  
  var airports = [];
  var navaids = [];
  var fixes = [];
  var airways =[];
  
  aptNavData.findAirportsInBounds(left,bottom,right,top,function(airports){
    aptNavData.findNavaidsInBounds(left,bottom,right,top,function(navaids){
      aptNavData.findFixesInBounds(left,bottom,right,top,function(fixes){
       aptNavData.findAirwaysInBounds(left,bottom,right,top,function(airways){
        res.json({bounds:{left:left,top:top,right:right,bottom:bottom},airports:airports,navaids:navaids,fixes:fixes,airways:airways}); 
       });
      });
    });
  });
}

exports.airportJson = function(req,res)
{
  var aptNavData = new AptNavData(app.db);
  aptNavData.findAirportByIcao(req.params.icao,function(airport){
    res.json({airport:airport});
  });
}

exports.airportsSearchJson = function(req,res)
{
  var aptNavData = new AptNavData(app.db);
  aptNavData.findAirportsMatching(req.params.search,function(airports){
    res.json({airports:airports});
  });
}

exports.searchJson = function(req,res)
{
  var aptNavData = new AptNavData(app.db);
  var results = {
    airports:[],
    fixes:[],
    navaids:[]
  };
  aptNavData.findAirportsMatching(req.params.search,function(airports){
    results.airports = airports;

    aptNavData.findFixesMatching(req.params.search,function(fixes){
      results.fixes = fixes;

      aptNavData.findNavaidsMatching(req.params.search,function(navaids){
        results.navaids = navaids;
        res.json(results);
      });
    });
  });
}

exports.navaidJson = function(req,res)
{
  var aptNavData = new AptNavData(app.db);
  aptNavData.findNavaidById(parseInt(req.params.id),function(navaid){
    res.json({navaid:navaid});
  });
}

exports.fixJson = function(req,res)
{
  var aptNavData = new AptNavData(app.db);
  aptNavData.findFixById(parseInt(req.params.id),function(fix){
    res.json({fix:fix});
  });
}

exports.getAircrafts = function(req,res)
{
  request('http://atilla.hinttech.nl/fseconomy/xml?query=AircraftConfigs',function(er,response,body){
    res.header('Content-Type','xml');
    res.send(body);
  });
}

exports.getJobsFrom = function(req,res)
{
  request("http://atilla.hinttech.nl/fseconomy/xml?query=JobsFeedFrom&icao='"+req.params.icao+"'",function(er,response,body){
    res.header('Content-Type','xml');
    res.send(body);
  });
}

exports.getJobsTo = function(req,res)
{
  request("http://atilla.hinttech.nl/fseconomy/xml?query=JobsFeedTo&icao='"+req.params.icao+"'",function(er,response,body){
    res.header('Content-Type','xml');
    res.send(body);
  });
}

exports.getFms = function(req,res)
{
  var route = JSON.parse(decodeURIComponent(req.params['route']));
  var fmsExporter = new FmsExporter();
  res.header('Content-Type','application/fms');
  res.header('Content-Disposition','filename='+route.name.urlized('_')+'.fms');
  fmsExporter.fromRoute(route,function(fms){
    res.send(fms);
  });
}