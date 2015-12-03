/*
 * TEST request_queue
 *
 * Author: Rafal Michalski (c) 2015
 */
var test = require("tap").test
var RequestQueue = require("../../js/index").request_queue.RequestQueue

test('should be empty', function(t) {
  var rq = new RequestQueue();
  t.type(rq, RequestQueue);
  t.type(rq, Array);
  t.strictEqual(rq.length, 0);
  t.strictEqual(rq.finished, false);
  rq.fail();
  t.strictEqual(rq.finished, true);
  t.end();
});

test('should succeed once', function(t) {
  t.plan(16);
  var counter = 0;

  function callback(err, ok) {
    counter++;
    t.equal(err, null);
    t.equal(ok, 'ok');
  }

  var rq = new RequestQueue(callback, callback);
  t.type(rq, RequestQueue);
  t.type(rq, Array);
  t.strictEqual(rq.length, 2);
  rq.push(callback);
  t.strictEqual(rq.length, 3);
  t.strictEqual(rq.finished, false);
  t.strictEqual(counter, 0);
  rq.succeed('ok');
  t.strictEqual(counter, 3);
  t.strictEqual(rq.finished, true);
  rq.succeed('ok');
  t.strictEqual(counter, 3);
  rq.fail(new Error('foo'));
  t.strictEqual(counter, 3);
});

test('should fail once', function(t) {
  t.plan(15);

  var counter = 0;

  function callback(err, ok) {
    counter++;
    t.type(err, Error);
    t.strictEqual(ok, void(0));
  }

  var rq = new RequestQueue();
  t.type(rq, RequestQueue);
  t.type(rq, Array);
  t.strictEqual(rq.length, 0);

  rq.push(callback);
  t.strictEqual(rq.length, 1);
  rq.push(callback);
  t.strictEqual(rq.length, 2);
  t.strictEqual(rq.finished, false);
  t.strictEqual(counter, 0);
  rq.fail(new Error('foo'));
  t.strictEqual(counter, 2);
  t.strictEqual(rq.finished, true);
  rq.succeed('ok');
  t.strictEqual(counter, 2);
  rq.fail(new Error('foo'));
  t.strictEqual(counter, 2);
});

test('should raise on callback error', function(t) {
  t.plan(6);

  function callback() {
    throw new Error("foo");
  }

  var rq = new RequestQueue(callback);
  t.type(rq, RequestQueue);
  t.type(rq, Array);
  t.strictEqual(rq.length, 1);

  t.strictEqual(rq.finished, false);
  t.throws(function() {
    rq.succeed('ok');
  }, {message: "foo"});
  t.strictEqual(rq.finished, true);

});

test('should handle custom error on callback error', function(t) {
  t.plan(7);

  function callback() {
    throw new Error("bar");
  }

  var rq = new RequestQueue(callback);
  t.type(rq, RequestQueue);
  t.type(rq, Array);
  t.strictEqual(rq.length, 1);

  rq.error = function(err) {
    t.type(err, Error)
    t.strictEqual(err.message, "bar");
  };

  t.strictEqual(rq.finished, false);
  rq.succeed('ok');
  t.strictEqual(rq.finished, true);

});

test('should install global handle error on callback error', function(t) {
  t.plan(7);

  require('../../js/request_queue').error = function(err) {
    t.type(err, Error)
    t.strictEqual(err.message, "baz");
  };

  function callback() {
    throw new Error("baz");
  }

  var rq = new RequestQueue(callback);
  t.type(rq, RequestQueue);
  t.type(rq, Array);
  t.strictEqual(rq.length, 1);

  t.strictEqual(rq.finished, false);
  rq.succeed('ok');
  t.strictEqual(rq.finished, true);

});
