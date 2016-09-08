Various Node Utils
==================

The utilities in this module are lazily loaded so they don't pollute memory unless needed.

Crypt
-----

Create entropy keys, store, load, crypt, sign and verify.

```js
var crypt = require('node-tools').crypt;
crypt.loadOrCreateEncryptorDecryptor('/path/to/entropy_key', null, null, function(err, encrypt, decrypt) {
  assert.ifError(err);
  var dataToEncrypt = new Buffer('some data');
  encrypt(dataToEncrypt, function(err, encryptedData) {
    assert.ifError(err);
    decrypt(encryptedData, function(err, originalData) {
      assert.ifError(err);
      assert.deepEqual(originalData, dataToEncrypt);
    });
  })
});
```

Domains
-------

Create domain name lookup similar to cookie domain pattern matching.

```js
var domains = require('node-tools').domains;
var patterns = {
  ".foo.com":    "anything ending with foo.com",
  "www.foo.com": "home page",
  "*.bar.com":   "any subdomain of bar.com",
  "bar.com":     "root domain of bar.com",
  "*":           "anything else"
};
var matcher = domains.createDomainMatcher(patterns, true);
assert.strictEqual(matcher("www.foo.com"),     "home page");
assert.strictEqual(matcher("foo.com"),         "anything ending with foo.com");
assert.strictEqual(matcher("foe.fee.foo.com"), "anything ending with foo.com");
assert.strictEqual(matcher("www.bar.com"),     "any subdomain of bar.com");
assert.strictEqual(matcher("bar.com"),         "root domain of bar.com");
assert.strictEqual(matcher("baz.com"),         "anything else");
```

Encode
------

```js
var encode = require('node-tools').encode;

encode.encode(new Buffer([1,128,255,250]), 'base64urlsafe') === 'AYD_-g'
encode.encode(new Buffer([1,2,3,4]), 'hex') === '01020304'
encode.decode('AYD_-g', 'url').equals(new Buffer([1,128,255,250]))
```

Intervals
---------

```js
var parse = require('node-tools').intervals.parseIntervalMs;
parse(10)         === 10;
parse("10")       === 10;
parse("10 ms")    === 10;
parse("10millis") === 10;
parse("1s")       === 1000;
parse("1 second") === 1000;
parse("2.5m")     === 2500*60;
parse("2.5 min")  === 2500*60;
parse("3 h")      === 3000*60*60;
parse("3hours")   === 3000*60*60;
parse("4.2d")     === 4200*60*60*24;
parse("5 days")   === 5000*60*60*24;
parse("6w")       === 6000*60*60*24*7;
parse("6 weeks")  === 6000*60*60*24*7;
```

Interpolate
-----------

```js
var interpolate = require('node-tools').interpolate.interpolate2;
interpolate("foo ${bar}", {bar: 42}) === "foo 42";
interpolate("foo ${bar.baz}", {bar: {baz: 42}}) === "foo 42";
```

Middleware
----------

### koa_model_session

```js
var session = require('node-tools').middleware.
              koa_model_session(require('koa-session'), {
    // session options
    model: {
      encode: function({Object}) {...} // return {Buffer}
      decode: function({Buffer}) {...} // return {Object}
    },
    crypt: {
      encrypt: function({Buffer}){...} // return {Buffer}
      decrypt: function({Buffer}){...} // return {Buffer}
    }
  }, app);
```

Promisify
---------

This implementation allows to omit original function arguments.
(e.g.: the bluebird's doesn't).


```js
var promisify = require('node-tools').promisify;
var delay = promisify(function delay(wait, arg, callback) {
  setTimeout(callback, wait|0, null, arg);
});
// with callback like original function
delay(100, 'foo', function(err, arg) {
  assert.equals(arg, 'foo');
});
// without callback returns promise
delay(100, 'foo').then(function(arg) {
  assert.equals(arg, 'foo');
});
// may omit last arguments (or all)
delay(100).then(function(arg) {
  assert.equals(arg, undefined);
});
delay().then(function(arg) {
  assert.equals(arg, undefined);
});
```

Util
----

Type check functions:

```js
var util = require('node-tools').util;
util.isArray([])
util.isBoolean(true)
util.isBuffer(new Buffer(0))
util.isDate(new Date())
util.isError(new Error("foo"))
util.isFunction(function() {})
util.isNull(null)
util.isNullOrUndefined(null)
util.isNumber(1)
util.isObject(new Foo)
util.isPlainObject({})
util.isPrimitive('bar')
util.isRegExp(/regexp/)
util.isScalar(1)
util.isString('foo')
util.isSymbol(Symbol('foo'))
util.isTypedArray(new Uint32Array(0))
util.isUndefined(void(0))
```
