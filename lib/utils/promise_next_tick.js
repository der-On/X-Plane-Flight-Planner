'use strict';

require('./set_immediate_polyfill');

var isBrowser = typeof process === 'undefined';
module.exports = function (cb) {
  return new Promise(function (resolve, reject) {
    if (isBrowser) {
      setImmediate(function () {
        resolve(cb());
      });
    } else {
      process.nextTick(function () {
        resolve(cb());
      });
    }
  });
};
