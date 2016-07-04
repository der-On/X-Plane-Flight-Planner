'use strict';

module.exports = function Fix (data) {
  return Object.assign({
    lat: 0,
    lon: 0,
    name: null,
    id: null
  }, data || {});
};
