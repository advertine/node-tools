/*
 * TOOL promisify
 *
 * Author: Rafal Michalski (c) 2015
 */
var slice = Array.prototype.slice;

module.exports = function promisify(fn) {
  fn = getOriginFunction(fn);

  var arity = fn.length - 1;

  if (arity < 0)
    throw new TypeError("promisify: function should have at least callback argument");

  var args = new Array(arity);

  while(arity-- > 0)
    args[arity] = 'a' + arity + ',';

  args = args.join('') + 'cb';

  eval('var wrap = function ' + fn.name + '(' + args + ') { \
    if (!cb) {                                              \
      var promise = new Promise(function(resolve, reject) { \
        cb = function(err, res) {                           \
          if (err) reject(err); else {                      \
            if (arguments.length > 2)                       \
              res = slice.call(arguments, 1);               \
            resolve(res);                                   \
          }                                                 \
        };                                                  \
      });                                                   \
    }                                                       \
    try {                                                   \
      fn.call(this,' + args + ');                           \
    } catch(err) {                                          \
      cb(err);                                              \
    }                                                       \
    return promise;                                         \
  }');

  args = void(0);
  wrap._origin_fn = fn;
  return wrap;
}

function getOriginFunction(fn) {
  return 'function' === typeof fn._origin_fn &&
            fn.name === fn._origin_fn.name ?
                             fn._origin_fn : fn;
}
