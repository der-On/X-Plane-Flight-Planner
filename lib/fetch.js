'use strict';

var g = (global || window);
if (typeof g.fetch === 'undefined') {
  if (typeof window !== 'undefined') {
    require('es6-promise').polyfill();
    require('whatwg-fetch');
  } else {
    g.fetch = require('node-fetch');
  }
}
