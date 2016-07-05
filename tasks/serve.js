'use strict';

var path = require('path');
var distPath = path.join(__dirname, '../dist');
var express = require('express');
var app = express();

app
  .use(express.static(distPath))
  .listen(process.env.PORT || 8080);

module.exports = app;
