'use strict';

module.exports = function (array, predicate) {
  var filtered = [];
  var i = 0;
  if (array.length === 0) {
    return Promise.resolve(filtered);
  }

  return new Promise(function (resolve, reject) {
    function next() {
      predicate(array[i], i, array)
        .then(function (contains) {
          if (contains) {
            filtered.push(array[i]);
          }

          i++;

          if (i === array.length) {
            return resolve(filtered);
          }

          next();
        })
        .catch(reject);
    }

    next();
  });
};
