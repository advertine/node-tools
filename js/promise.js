var Promise;

if (['bluebird', 'promise']
    .every(function(module) {
      try {
         Promise = require(module);
      } catch(e) {
        return true;
      }
    })) Promise = global.Promise;

if ('function' !== typeof Promise)
  throw new Error("no promise implementation found");

module.exports = Promise;
