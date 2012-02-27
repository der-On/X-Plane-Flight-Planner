var AptNavData = require('../lib/apt_nav_data').AptNavData;
var AptNavParser = require('../lib/apt_nav_parser').AptNavParser;

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'X-Plane Flight Planner' })
};

exports.parse = function(req,res){
  var aptNavData = new AptNavData();
  var aptNavParser = new AptNavParser();
  var airports = aptNavParser.parseAirports('apt_nav/apt.dat');
  
  aptNavData.clearAirports();
  aptNavData.saveAirports(airports);
  
  res.render('parse', { title: 'X-Plane Flight Planner', airports: airports });
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