Various Node Utils
==================

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

Encode
------

```js
var encode = require('node-tools').encode;

encode.encode(new Buffer([1,128,255,250]), 'base64urlsafe') === 'AYD_-g'
encode.encode(new Buffer([1,2,3,4]), 'hex') === '01020304'
encode.decode('AYD_-g', 'url').equals(new Buffer([1,128,255,250]))
```


Promisify
---------

```js
var promisify = require('node-tools').promisify;
var delay = promisify(function delay(wait, arg, callback) {
  setTimeout(callback, wait, null, arg);
});
// with callback like original function
delay(100, 'foo', function(err, arg) {
  assert.equals(arg, 'foo');  
});
// without callback returns promise
delay(100, 'foo').then(function(arg) {
  assert.equals(arg, 'foo');
});
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
