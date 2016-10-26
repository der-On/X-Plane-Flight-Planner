'use strict';

var path = require('path');
var distPath = path.join(__dirname, '../dist');
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
app
  .use(express.static(distPath))
  .listen(port);

console.log('Listening on http://localhost:' + port);

module.exports = app;
