
/**
 * Module dependencies.
 */

var local_config = require('./local_config').config;

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //app.use(express.compiler({ src: __dirname + '/public', enable:['less']}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// DB
var mongo = require('mongoskin');
var db = mongo.db(local_config.mongodb.user+':'+local_config.mongodb.password+'@'+local_config.mongodb.host+'/x-plane_apt_nav?auto_reconnect');

exports.db = db;

// Routes

app.get(local_config.base+'', routes.index);
if(local_config.enable_import) {
  app.get(local_config.base+'/import', routes.importing);
  app.get(local_config.base+'/import/airports', routes.importAirports);
  app.get(local_config.base+'/import/navaids', routes.importNavaids);
  app.get(local_config.base+'/import/fixes', routes.importFixes);
  app.get(local_config.base+'/import/airways', routes.importAirways);
}
app.get(local_config.base+'/apt-nav-json',routes.aptNavJson);
app.get(local_config.base+'/airport-json/:icao',routes.airportJson);
app.get(local_config.base+'/airports-search-json/:search',routes.airportsSearchJson);
app.get(local_config.base+'/navaid-json/:id',routes.navaidJson);
app.get(local_config.base+'/fix-json/:id',routes.fixJson);
app.get(local_config.base+'/fse-aircrafts',routes.getAircrafts);
app.get(local_config.base+'/fse-jobs-from/:icao',routes.getJobsFrom);
app.get(local_config.base+'/fse-jobs-to/:icao',routes.getJobsTo);
app.get(local_config.base+'/json-fms/:route',routes.getFms);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
