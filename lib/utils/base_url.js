'use strict';

module.exports = function () {
  return (typeof window !== 'undefined') ?
    window.location.href.split('#')[0]
  : 'http://localhost:' + (process.env.PORT || 8080);
};
