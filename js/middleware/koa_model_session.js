/*
 * MIDDLEWARE koa-model-session
 *
 * Author: Rafal Michalski (c) 2015
 */
var encode = require('../encode')
  , base64UrlSafeEncode = encode.base64UrlSafeEncode
  , base64UrlSafeDecode = encode.base64UrlSafeDecode

var JsonModel = {
  encode: function(object) {
    return new Buffer(JSON.stringify(object), 'utf8');
  },
  decode: function(data) {
    return JSON.parse(data.toString('utf8'));
  }
};

module.exports = function(session, options, app) {
  if (options && 'function' === typeof options.use) {
    app = options, options = arguments[1];
  }

  options || (options = {});

  var model = options.model || JsonModel;

  var crypt = options.crypt;

  if (null == options.signed) options.signed = !crypt;

  options.encode = function(body) {
    var data = model.encode(body);
    if (crypt)
      data = crypt.encrypt(data);
    return base64UrlSafeEncode(data);
  };

  options.decode = function(string) {
    var data = base64UrlSafeDecode(string);
    if (crypt) {
      data = crypt.decrypt(data);
      if (!data)
        return null;
    }
    var body = model.decode(data);
    // check if the cookie has expired
    if (!body || !body._expire || body._expire < Date.now())
      return null;

    return body;
  };

  return session(options, app);
};
