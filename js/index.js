/*
 * TOOL index
 *
 * Author: Rafal Michalski (c) 2015
 */
var path = require('path');
exports.lazyLoadModules = lazyLoadModules;

lazyLoadModules(__dirname, exports, 'crypt domains encode interpolate intervals promisify regexp request_queue');

var middleware = exports.middleware = {};
lazyLoadModules(path.join(__dirname, 'middleware'), middleware, 'koa_model_session');

function lazyLoadModules(dirname, object, names) {
  if ('string' === typeof names)
    names = names.trim().split(/\s+/);

  names.forEach(lazyLoadModuleInstall.bind(null, dirname, object));
}

function lazyLoadModuleInstall(dirname, object, name) {
  var mod;
  Object.defineProperty(object, name, {
    get: function() { return mod || (mod = require(path.join(dirname, name))) },
    enumerable: true,
    configurable: true
  });
}
