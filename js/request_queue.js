/*
 * TOOL request_queue
 *
 * Author: Rafal Michalski (c) 2015
 */
var util = require('util');

var push = Array.prototype.push;

var errorHandler = function(err) { throw err; };

exports.__defineSetter__('error', function(handler) {
  if ('function' === typeof handler)
    errorHandler = handler;
  else
    throw new Error("error handler needs to be a function");
});

function RequestQueue() {
  push.apply(this, arguments);
  this.finished = false;
}

/* inherit from Array */
util.inherits(RequestQueue, Array);

exports.RequestQueue = RequestQueue;

RequestQueue.prototype.error = function(err) {
  errorHandler.call(this, err);
};

RequestQueue.prototype.fail = function(err) {
  if (this.finished) return;
  this.finished = true;
  var cb;
  while(cb = this.shift()) {
    try {
      cb(err);
    } catch(e) {
      this.error(e);
    };
  }
};

RequestQueue.prototype.succeed = function() {
  if (this.finished) return;
  this.finished = true;
  var cb, args = [null];
  push.apply(args, arguments);
  while(cb = this.shift()) {
    try {
      cb.apply(null, args);
    } catch(e) {
      this.error(e);
    };
  }
};
