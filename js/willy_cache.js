/*
 * TOOL willy_cache
 *
 * Author: Rafal Michalski (c) 2015
 */
var Cache = Map;

var RequestQueue = require('./request_queue').RequestQueue;

function GetSetWilly() {
  this.cache = new Cache;
}

module.exports = GetSetWilly;

GetSetWilly.prototype.willSet = function(key, generator, callback) {
  var cache = this.cache
    , queue = new RequestQueue();

  if (callback) queue.push(callback);

  cache.set(key, queue);

  generator(function(err, value) {
    if (err) {
      if (cache.get(key) === queue)
        cache.delete(key);
      queue.fail(err);
    } else {
      if (cache.get(key) === queue)
        cache.set(key, value);
      queue.succeed(value);
    }
  });
};

GetSetWilly.prototype.getOrWillSet = function(key, generator, callback) {
  var cache = this.cache,
      value = cache.get(key);

  if ('undefined' === typeof value) {
    this.willSet(key, generator, callback);
  } else if (value instanceof RequestQueue) {
    value.push(callback);
  } else {
    callback(null, value);
  }
};

GetSetWilly.prototype.willGet = function(key, callback) {
  var value = this.cache.get(key);

  if (value instanceof RequestQueue) {
    value.push(callback);
  } else {
    callback(null, value);
  }
};

GetSetWilly.prototype.set = function(key, value) {
  this.cache.set(key, value);
};

GetSetWilly.prototype.setnx = function(key, value) {
  var cache = this.cache;
  if ('undefined' === typeof cache.get(key)) {
    cache.set(key, value);
    return true;
  }
  return false;
};

GetSetWilly.prototype.get = function(key) {
  var value = this.cache.get(key);
  if (value instanceof RequestQueue)
    value = void(0);
  return value;
};

GetSetWilly.prototype.getset = function(key, value) {
  var cache = this.cache,
     oldval = cache.get(key);

  if (oldval instanceof RequestQueue)
    oldval = void(0);
  cache.set(key, value);
  return oldval;
};

GetSetWilly.prototype.delete = GetSetWilly.prototype.remove = function(key) {
  this.cache.delete(key);
};

GetSetWilly.prototype.fetch = function(key) {
  var value = this.get(key);
  this.cache.delete(key);
  return value;
};

GetSetWilly.prototype.willBeSet = function(key) {
  return this.cache.get(key) instanceof RequestQueue;
};

GetSetWilly.prototype.isNowSet = function(key) {
  var value = this.cache.get(key);
  return 'undefined' !== typeof value && !(value instanceof RequestQueue);
};

GetSetWilly.prototype.has = GetSetWilly.prototype.isOrWillBeSet = function(key) {
  return this.cache.has(key);
};

GetSetWilly.prototype.clear = function() {
  this.cache.clear();
};

GetSetWilly.prototype.forEach = GetSetWilly.prototype.each = function(iterator, context) {
  var self = this;

  this.cache.forEach(function(value, key) {
    if (!(value instanceof RequestQueue))
      iterator.call(context, value, key, self);
  });
};

GetSetWilly.prototype.keys = function() {
  var keys = [];

  this.cache.forEach(function(value, key) {
    if (!(value instanceof RequestQueue))
      keys.push(key);
  });
  return keys;
};
