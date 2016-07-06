'use strict';

module.exports = function (array, predicate) {
  var mapped = [];
  var i = 0;
  if (array.length === 0) {
    return Promise.resolve(mapped);
  }

  return new Promise(function (resolve, reject) {
    function next() {
      predicate(array[i], i, array)
        .then(function (value) {
          mapped.push(value);

          i++;

          if (i === array.length) {
            return resolve(mapped);
          }

          next();
        })
        .catch(reject);
    }

    next();
  });
};
