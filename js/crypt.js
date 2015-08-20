/*
 * TOOL crypt
 *
 * Author: Rafal Michalski (c) 2015
 */
var fs = require('fs')
  , crypto = require('crypto');

var config = {
  cryptoAlgorithm: 'aes-256-cbc',
  signatureHmacAlgorithm: 'sha256',
  entropyHmacAlgorithm: 'sha256'
};

exports.config = config;
exports.timingSafeComparison = timingSafeComparison;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.loadOrCreateKeyIv = loadOrCreateKeyIv;
exports.createEncryptorDecryptor = createEncryptorDecryptor;

/**
 * Create pair encryptor and decryptor functions using key loaded from entropy file.
 * If entropy file doesn't exitst creates new entropy.
 *
 * WARNING: This functions is vulnerable to race conditions. FIXME!
 *
 * @param {string} filePath - a path to entropy file
 * @param {string|Buffer} [password] - optional: pass null to create password
 * @param {string|Buffer} [salt] - optional: pass null to create salt
 * @param {Function} callback - function(err, encryptor, decryptor)
**/
exports.loadOrCreateEncryptorDecryptor = function(filePath, password, salt, callback) {
  loadOrCreateKeyIv(filePath, password, salt, function(err, cipherKey, iv, hmacKey) {
    if (err) return callback(err);
    createEncryptorDecryptor(cipherKey, iv, hmacKey, callback);
  });
};

function createEncryptorDecryptor(cipherKey, iv, hmacKey, callback) {
  function encryptor(data, callback) {
    encrypt(cipherKey, iv, hmacKey, data, callback);
  }

  function decryptor(dataEncrypted, callback) {
    decrypt(cipherKey, iv, hmacKey, dataEncrypted, callback);
  }

  if (callback)
    callback(null, encryptor, decryptor);
  else
    return [encryptor, decryptor];
};

function loadOrCreateKeyIv(filePath, password, salt, callback) {
  fs.readFile(filePath, function(err, entropy) {
    if (err) {
      if (err.code !== 'ENOENT')
        return callback(err);
    }
    if (entropy && entropy.length === 80) {
      extractKeyIv(entropy, callback);
    } else {
      createEntropy(password, salt, function(err, entropy) {
        if (err) return callback(err);
        fs.writeFile(filePath, entropy, function(err) {
          if (err) return callback(err);
          extractKeyIv(entropy, callback);
        });
      });
    }
  });
};

function createEntropy(password, salt, callback) {
  password || (password = crypto.randomBytes(6));
  salt     || (salt     = crypto.randomBytes(64));

  crypto.pbkdf2(password, salt, 16384, 80, config.entropyHmacAlgorithm, callback);
}

function extractKeyIv(entropy, callback) {
  var iv        = entropy.slice(0, 16)   // [  0:128]
    , cipherKey = entropy.slice(16, 48)  // [128:384]
    , hmacKey   = entropy.slice(48, 80); // [384:640]
  callback(null, cipherKey, iv, hmacKey);
}

function encrypt(cipherKey, iv, hmacKey, data, algorithm, callback) {
  if ('function' === typeof algorithm)
    callback = algorithm, algorithm = null;

  algorithm || (algorithm = config.cryptoAlgorithm);

  try {
    var cipher = crypto.createCipheriv(algorithm, cipherKey, iv);
    cipher.end(data, function() {
      try {
        var cipherbody = cipher.read()
          , authbody = crypto.createHmac(config.signatureHmacAlgorithm, hmacKey).update(cipherbody).digest();
      } catch(err) { return callback(err); }

      callback(null, Buffer.concat([authbody, cipherbody]));
    });
  } catch(err) { return callback(err); }
};

function decrypt(cipherKey, iv, hmacKey, dataEncrypted, algorithm, callback) {
  if ('function' === typeof algorithm)
    callback = algorithm, algorithm = null;

  algorithm || (algorithm = config.cryptoAlgorithm);

  try {
    var authbody = dataEncrypted.slice(0, 32)
      , cipherbody = dataEncrypted.slice(32)
      , verify = crypto.createHmac(config.signatureHmacAlgorithm, hmacKey).update(cipherbody).digest()
      , decipher = crypto.createDecipheriv(algorithm, cipherKey, iv);

    if (timingSafeComparison(verify, authbody)) {
      decipher.end(cipherbody, function() {
        try {
          var data = decipher.read();
        } catch(err) { return callback(err); }
        callback(null, data);
      });
    } else
      callback(null, null);
  } catch(err) { return callback(err); }
};

function timingSafeComparison(buf1, buf2) {
  var result = true, i = buf1.length;
  while (i-- > 0) {
    if (buf1[i] !== buf2[i])
      result = false;
  }
  return result;
};
