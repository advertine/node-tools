/*
 * TEST promisify
 *
 * Author: Rafal Michalski (c) 2015
 */
var test = require("tap").test
var Promise = require('../../js/promise');
var promisify = require("../../js/index").promisify;

test("should be a function", function(t) {
  t.type(promisify, 'function');
  t.end();
});

test("should promisify thunk", function(t) {
  t.plan(6);

  var thunk = promisify(function thunk(next) { 
    setTimeout(next, 100, null, 'foo');
  });

  t.strictEqual(thunk.name, 'thunk');
  t.strictEqual(thunk.length, 1);

  thunk(function(err, str) {
    t.ifErr(err);
    t.strictEqual(str, 'foo');
    var promise = thunk();
    t.type(promise, Promise);
    promise.then(function(str) {
      t.strictEqual(str, 'foo');
    }, function(err) {
      t.ifErr(err);
      t.fail('reject should not be called');
    })
  });

});

test("should promisify thunk calling error", function(t) {
  t.plan(7);

  var thunk = promisify(function thunk(next) { 
    setTimeout(next, 100, new Error('baa'));
  });

  t.strictEqual(thunk.name, 'thunk');
  t.strictEqual(thunk.length, 1);

  thunk(function(err) {
    t.type(err, Error);
    t.strictEqual(err.message, 'baa');
    var promise = thunk();
    t.type(promise, Promise);
    promise.then(function() {
      t.fail('resolve should not be called');
    }, function(err) {
      t.type(err, Error);
      t.strictEqual(err.message, 'baa');
    })
  });

});

test("should promisify thunk throwing error", function(t) {
  t.plan(7);

  var thunk = promisify(function thunk(next) { 
    throw new Error('moo!');
  });

  t.strictEqual(thunk.name, 'thunk');
  t.strictEqual(thunk.length, 1);

  thunk(function(err) {
    t.type(err, Error);
    t.strictEqual(err.message, 'moo!');
    var promise = thunk();
    t.type(promise, Promise);
    promise.then(function() {
      t.fail('resolve should not be called');
    }, function(err) {
      t.type(err, Error);
      t.strictEqual(err.message, 'moo!');
    })
  });

});

test("should not promisify function without callback argument", function(t) {
  t.throws(function() {
    promisify(function empty() {});
  }, {message: "promisify: function should have at least callback argument defined"});
  t.end();
});

test("should promisify many argument function", function(t) {
  t.plan(7);

  var thunk = promisify(function thunk(a, b, next) { 
    setTimeout(next, 100, null, a, b);
  });

  t.strictEqual(thunk.name, 'thunk');
  t.strictEqual(thunk.length, 3);

  thunk('foo', 'bar', function(err, res1, res2) {
    t.ifErr(err);
    t.strictEqual(res1, 'foo');
    t.strictEqual(res2, 'bar');
    var promise = thunk('foo', 'bar');
    t.type(promise, Promise);
    promise.then(function(res) {
      t.deepEqual(res, ['foo', 'bar']);
    }, function(err) {
      t.ifErr(err);
      t.fail('reject should not be called');
    })
  });
});

test("should promisify many argument function with single resolve argument", function(t) {
  t.plan(7);

  var thunk = promisify(function thunk(a, b, next) { 
    setTimeout(next, 100, null, a, b);
  }, true);

  t.strictEqual(thunk.name, 'thunk');
  t.strictEqual(thunk.length, 3);

  thunk('foo', 'bar', function(err, res1, res2) {
    t.ifErr(err);
    t.strictEqual(res1, 'foo');
    t.strictEqual(res2, 'bar');
    var promise = thunk('foo', 'bar');
    t.type(promise, Promise);
    promise.then(function(res) {
      t.deepEqual(res, 'foo');
    }, function(err) {
      t.ifErr(err);
      t.fail('reject should not be called');
    })
  });
});

test("should allow omiting arguments of promisified function", function(t) {
  t.plan(4);

  var thunk = promisify(function thunk(a, b, next) { 
    setTimeout(next, 100, null, a, b);
  });

  t.strictEqual(thunk.name, 'thunk');
  t.strictEqual(thunk.length, 3);

  Promise.all([
    thunk('foo').then(function(res) {
      t.deepEqual(res, ['foo', void(0)]);
    }, function(err) {
      t.ifErr(err);
      t.fail('reject should not be called');
    }),
    thunk().then(function(res) {
      t.deepEqual(res, [void(0), void(0)]);
    }, function(err) {
      t.ifErr(err);
      t.fail('reject should not be called');
    })
  ]);

});

test("should promisify pass context", function(t) {
  t.plan(8);

  var context = {
    thunk: promisify(function thunk(next) {
      t.strictEqual(this, context);
      next(null, 'baz');
    })
  }

  t.strictEqual(context.thunk.name, 'thunk');
  t.strictEqual(context.thunk.length, 1);

  context.thunk(function(err, str) {
    t.ifErr(err);
    t.strictEqual(str, 'baz');
    var promise = context.thunk();
    t.type(promise, Promise);
    promise.then(function(str) {
      t.strictEqual(str, 'baz');
    }, function(err) {
      t.ifErr(err);
      t.fail('reject should not be called');
    })
  });
});
