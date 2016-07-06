'use strict';

var g = (global || window);

if (typeof g.setImmediate !== 'function') {
  g.setImmediate = function (cb) {
    cb();
    //setTimeout(cb, 0);
  };
}
