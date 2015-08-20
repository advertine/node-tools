/*
 * TOOL encode
 *
 * Author: Rafal Michalski (c) 2015
 */
var encodeRe = /[\/+]/g
  , decodeRe = /[_-]/g

exports.base64UrlSafeEncode = base64UrlSafeEncode;
exports.base64UrlSafeDecode = base64UrlSafeDecode;

function base64UrlSafeEncode(data) {
  data = data.toString('base64').replace(encodeRe, encodeTr);
  var index = data.indexOf('=');
  if (index >= 0)
    data = data.slice(0, index);
  return data;
}

function base64UrlSafeDecode(data) {
  return new Buffer(data.replace(decodeRe, decodeTr), 'base64');
}

exports.encode = function encode(data, encoding) {
  switch(encoding) {
    case 'url':
    case 'base64url':
    case 'base64urlsafe':
    case 'base64safe':
      data = base64UrlSafeEncode(data);
      break;
    default:
      data = data.toString(encoding);
  }
  return data;
};

exports.decode = function decode(data, encoding) {
  switch(encoding) {
    case 'url':
    case 'base64url':
    case 'base64urlsafe':
    case 'base64safe':
      data = base64UrlSafeDecode(data);
      break;
    default:
      data = new Buffer(data, encoding);
  }
  return data;
};

function encodeTr(found) {
  return found === '/' ? '_' : '-';
}

function decodeTr(found) {
  return found === '_' ? '/' : '+';
}
