
/**
 * Module dependencies.
 */

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

app.get('/', routes.index);
app.get('/import', routes.importing);
app.get('/import/airports', routes.importAirports);
app.get('/import/navaids', routes.importNavaids);
app.get('/import/fixes', routes.importFixes);
app.get('/apt-nav-json',routes.aptNavJson);
app.get('/airport-json/:icao',routes.airportJson);
app.get('/airports-search-json/:search',routes.airportsSearchJson);
app.get('/navaid-json/:id',routes.navaidJson);
app.get('/fix-json/:id',routes.fixJson);
app.get('/fse-aircrafts',routes.getAircrafts);
app.get('/fse-jobs-from/:icao',routes.getJobsFrom);
app.get('/fse-jobs-to/:icao',routes.getJobsTo);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
