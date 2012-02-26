
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'X-Plane Flight Planner' })
};

exports.parse = function(req,res){
  var AptNavData = require('../lib/apt_nav_data').AptNavData;
  var AptNavParser = require('../lib/apt_nav_parser').AptNavParser;
  var aptNavParser = new AptNavParser();
  
  var airports = aptNavParser.parseAirports('apt_nav/apt.dat');
  
  aptNavData = new AptNavData();
  aptNavData.clearAirports();
  aptNavData.saveAirports(airports);
  
  res.render('parse', { title: 'X-Plane Flight Planner', airports: airports });
};