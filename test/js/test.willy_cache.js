/*
 * TEST willy_cache
 *
 * Author: Rafal Michalski (c) 2015
 */
var test = require("tap").test

var GetSetWilly = require("../../js/index").willy_cache;

test("should be a function", function(t) {
  t.type(GetSetWilly, 'function');
  t.end();
});

test("should create cache", function(t) {
  var cache = new GetSetWilly();
  t.type(cache, 'object');
  t.type(cache.cache, Map);
  t.end();
});

test("should set and get cache entries", function(t) {
  var cache = new GetSetWilly();
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
  t.strictEqual(cache.get('key'), 'bar');
  t.strictEqual(cache.has('key'), true);
  t.strictEqual(cache.fetch('key'), 'bar');
  t.strictEqual(cache.has('key'), false);
  t.end();
});

test("should create cache entry", function(t) {
  var cache = new GetSetWilly();
  cache.willSet('key', function generator(callback) {
    t.type(callback, 'function');
    t.strictEqual(callback.length, 2);

    setImmediate(callback, null, 'foo');

    t.strictEqual(cache.get('key'), void(0));

    cache.willSet('key', function generator(callback) {
      t.type(callback, 'function');
      t.strictEqual(callback.length, 2);

      setImmediate(callback, null, 'baz');

      t.strictEqual(cache.get('key'), void(0));
    }, function(err, value) {
      t.strictEqual(err, null);
      t.strictEqual(value, 'baz');
      t.strictEqual(cache.get('key'), void(0));
    });

  }, function(err, value) {
    t.strictEqual(err, null);
    t.strictEqual(value, 'foo');
    t.strictEqual(cache.get('key'), void(0));

    cache.willSet('key', function generator(callback) {
      t.type(callback, 'function');
      t.strictEqual(callback.length, 2);
      setImmediate(callback, null, 'bar');
      t.strictEqual(cache.get('key'), void(0));
    }, function(err, value) {
      t.strictEqual(err, null);
      t.strictEqual(value, 'bar');
      t.strictEqual(cache.get('key'), 'bar');
      t.end();
    });

  });
});

test("should not create cache entry", function(t) {
  var cache = new GetSetWilly();
  cache.willSet('key', function generator(callback) {
    t.type(callback, 'function');
    t.strictEqual(callback.length, 2);
    setImmediate(callback, new Error("some error"));
    t.strictEqual(cache.get('key'), void(0));
  }, function(err, value) {
    t.type(err, Error);
    t.strictEqual(err.message, "some error");
    t.strictEqual(value, void(0));
    t.strictEqual(cache.get('key'), void(0));
    t.end();
  });
});

test("should get wait or create cache entry", function(t) {
  var cache = new GetSetWilly();
  t.plan(10);

  cache.willGet('key', function(err, value) {
    t.strictEqual(err, null);
    t.type(value, 'undefined');
  });

  cache.getOrWillSet('key', function generator(callback) {
    t.type(callback, 'function');
    t.strictEqual(callback.length, 2);

    setImmediate(callback, null, 'foo');

    cache.willGet('key', function(err, value) {
      t.strictEqual(err, null);
      t.strictEqual(value, 'foo');
    });

    cache.getOrWillSet('key', function generator() {
      t.fail('the second generator should not be called');
    }, function(err, value) {
      t.strictEqual(err, null);
      t.strictEqual(value, 'foo');
    });

  }, function(err, value) {
    t.strictEqual(err, null);
    t.strictEqual(value, 'foo');
  });
});

test("should iterate and clear cache entries", function(t) {
  var cache = new GetSetWilly();
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
