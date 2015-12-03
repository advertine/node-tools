/*
 * TOOL ttl_cache
 *
 * Author: Rafal Michalski (c) 2015
 */
var Cache = Map;

var now = Date.now
  , round = Math.round;

function TtlCache() {
  this.cache = new Cache;
  this.queue = [];
  this._timeout = null;
}

function TtlValue(value, key, expire) {
  this.key = key;
  this.value = value;
  this.expire = expire;
}

module.exports = TtlCache;

TtlCache.prototype.has = function(key) {
  return this.cache.has(key);
};

TtlCache.prototype.get = function(key) {
  var value = this.cache.get(key);
  if (value instanceof TtlValue) {
    if (value.expire <= now()) {
      return;
    } else
      return value.value;
  }
  return value;
};

TtlCache.prototype.set = function(key, value, ttl) {
  if (ttl != null) {
    this.setTtl(key, value, ttl);
  } else
    this.cache.set(key, value);
};

TtlCache.prototype.getset = function(key, value, ttl) {
  var oldval = this.get(key);
  this.set(key, value, ttl);
  return oldval;
};

TtlCache.prototype.setnx = function(key, value, ttl) {
  if ('undefined' === typeof this.get(key)) {
    this.set(key, value, ttl);
    return true;
  }
  return false;
};

TtlCache.prototype.setTtl = function(key, value, ttl) {
  var time = now();
  setTtl.call(this, key, new TtlValue(value, key, time + ttl), time);
};

TtlCache.prototype.setExpire = function(key, value, expire) {
  setTtl.call(this, key, new TtlValue(value, key, expire), now());
};

TtlCache.prototype.delete = TtlCache.prototype.remove = function(key) {
  this.cache.delete(key);
};

TtlCache.prototype.fetch = function(key) {
  var value = this.get(key);
  this.cache.delete(key);
  return value;
};

TtlCache.prototype.forEach = TtlCache.prototype.each = function(iterator, context) {
  var self = this
    , time = now();

  this.cache.forEach(function(value, key) {
    if (value instanceof TtlValue) {
      if (value.expire <= time) {
        return;
      } else
        value = value.value;
    }
    iterator.call(context, value, key, self);
  });
};

TtlCache.prototype.keys = function() {
  var keys = []
    , time = now();

  this.cache.forEach(function(value, key) {
    if (value instanceof TtlValue && value.expire <= time)
      return;
    keys.push(key);
  });
  return keys;
};

TtlCache.prototype.clear = function() {
  this.cache.clear();
  this.queue.length = 0;
  clearTimeout(this._timeout);
  this._timeout = null;
};

function setTtl(key, ttlval, time) {
  var cache = this.cache
    , queue = this.queue
    , expire = ttlval.expire;

  cache.set(key, ttlval);
  var index = minGreaterExpireIndex(queue, expire);
  if (index === 0) {
    queue.unshift(ttlval);
    clearTimeout(this._timeout);
    setupTtlHandler(this, queue, cache, expire - time);
  } else {
    queue.splice(index, 0, ttlval);
  }
}

function setupTtlHandler(self, queue, cache, ttl) {
  self._timeout = setTimeout(function() {
    if ((ttl = expireNow(queue, cache)) != null)
      setupTtlHandler(self, queue, cache, ttl);
  }, ttl < 1000 ? 1000 : ttl + 1000);
}

function expireNow(queue, cache) {
  var key, ttlval
    , time = now();

  for (var i = 0, len = queue.length; i < len; ++i) {
    if ((ttlval = queue[i]).expire <= time) {
      if (ttlval === cache.get(key = ttlval.key))
        cache.delete(key);
    } else
      break;
  }
  if (i < len) {
    queue.splice(0, i);
    return queue[0].expire - time;
  } else
    queue.length = 0;
}

function minGreaterExpireIndex(queue, expire) {
  var size = queue.length;
  if (!size) return 0;
  if (expire < queue[0].expire) return 0;
  var max_index = size - 1;
  if (expire >= queue[max_index].expire) return size;
  var min_index = 1, index;
  while(max_index > min_index) {
    index = round((max_index + min_index) / 2);
    if (queue[index].expire <= expire) {
      min_index = index + 1;
    } else if (queue[index - 1].expire <= expire) {
      return index;
    } else if (max_index <= index) {
      max_index = index - 1;
    } else {
      max_index = index;
    }
  }
  return min_index;
}
