
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

// Routes

app.get(local_config.base+'', routes.index);
app.get(local_config.base+'/import', routes.importing);
app.get(local_config.base+'/import/airports', routes.importAirports);
app.get(local_config.base+'/import/navaids', routes.importNavaids);
app.get(local_config.base+'/import/fixes', routes.importFixes);
app.get(local_config.base+'/apt-nav-json',routes.aptNavJson);
app.get(local_config.base+'/airport-json/:icao',routes.airportJson);
app.get(local_config.base+'/airports-search-json/:search',routes.airportsSearchJson);
app.get(local_config.base+'/navaid-json/:id',routes.navaidJson);
app.get(local_config.base+'/fix-json/:id',routes.fixJson);
app.get(local_config.base+'/fse-aircrafts',routes.getAircrafts);
app.get(local_config.base+'/fse-jobs-from/:icao',routes.getJobsFrom);
app.get(local_config.base+'/fse-jobs-to/:icao',routes.getJobsTo);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
