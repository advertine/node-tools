/*
 * TOOL index
 *
 * Author: Rafal Michalski (c) 2015
 */
exports.lazyLoadModules = lazyLoadModules;

lazyLoadModules(exports, 'crypt encode promisify');

function lazyLoadModules(object, names) {
  if ('string' === typeof names)
    names = names.trim().split(/\s+/);

  names.forEach(lazyLoadModuleInstall.bind(null, object));
}

function lazyLoadModuleInstall(object, name) {
  var mod;
  Object.defineProperty(object, name, {
    get: function() { return mod || (mod = require('./' + name)) },
    enumerable: true,
    configurable: true
  });
}
