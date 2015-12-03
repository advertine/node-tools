/*
 * TEST ttl_cache
 *
 * Author: Rafal Michalski (c) 2015
 */
var test = require("tap").test

var TtlCache = require("../../js/index").ttl_cache;

test("should be a function", function(t) {
  t.type(TtlCache, 'function');
  t.end();
});

test("should create cache", function(t) {
  var cache = new TtlCache();
  t.type(cache, 'object');
  t.type(cache.cache, Map);
  t.type(cache.queue, Array);
  t.end();
});

test("should set and get cache entries", function(t) {
  var cache = new TtlCache();
  t.strictEqual(cache.get('key'), void(0));
  t.strictEqual(cache.set('key', 'bar'), void(0));
  t.strictEqual(cache.get('key'), 'bar');
  t.strictEqual(cache.getset('key', 'foo'), 'bar');
  t.strictEqual(cache.get('key'), 'foo');
  t.strictEqual(cache.has('key'), true);
  t.strictEqual(cache.delete('key'), void(0));
  t.strictEqual(cache.has('key'), false);
  t.strictEqual(cache.get('key'), void(0));
  t.strictEqual(cache.setnx('key', 'bar'), true);
  t.strictEqual(cache.setnx('key', 'foo'), false);
  t.strictEqual(cache.has('key'), true);
  t.strictEqual(cache.fetch('key'), 'bar');
  t.strictEqual(cache.has('key'), false);
  t.end();
});

test("should set ttl cache entry", function(t) {
  var cache = new TtlCache();

  t.plan(19);
  t.strictEqual(cache.set('key', 'bar', 100), void(0));
  t.strictEqual(cache.get('key'), 'bar');
  t.strictEqual(cache.set('key2', 'baz', 50), void(0));
  t.strictEqual(cache.get('key2'), 'baz');
  t.strictEqual(cache.set('key3', 'zoom', 150), void(0));
  t.strictEqual(cache.get('key3'), 'zoom');
  t.deepEqual(cache.keys(), ['key', 'key2', 'key3']);
  setTimeout(function() {
    t.strictEqual(cache.get('key'), 'bar');
    t.strictEqual(cache.get('key2'), void(0));
    t.strictEqual(cache.get('key3'), 'zoom');
    t.deepEqual(cache.keys(), ['key', 'key3']);
    setTimeout(function() {
      t.strictEqual(cache.get('key'), void(0));
      t.strictEqual(cache.get('key2'), void(0));
      t.strictEqual(cache.get('key3'), 'zoom');
      t.deepEqual(cache.keys(), ['key3']);
      setTimeout(function() {
        t.strictEqual(cache.get('key'), void(0));
        t.strictEqual(cache.get('key2'), void(0));
        t.strictEqual(cache.get('key3'), void(0));
        t.deepEqual(cache.keys(), []);
      }, 51);
    }, 51);
  }, 51);
});

test("should iterate and clear cache entries", function(t) {
  var cache = new TtlCache();
  cache.set('foo', 'fee');
  cache.set('bar', 'rab');
  cache.set('baz', 'zzz');

  var result = [];
  cache.each(function(value, key) {
    result.push([value, key]);
  });
  t.deepEqual(result, [
    ['fee', 'foo'],
    ['rab', 'bar'],
    ['zzz', 'baz'],
  ]);

  t.deepEqual(cache.keys(), [
    'foo',
    'bar',
    'baz',
  ]);

  cache.clear();
  cache.each(function(value, key) {
    t.fail("this should not iterate");
  });
  t.deepEqual(cache.keys(), []);

  t.end();
});
