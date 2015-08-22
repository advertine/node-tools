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
  entropyHmacAlgorithm: 'sha256',
  entropyIterations: 16384
};

exports.config = config;
exports.timingSafeComparison = timingSafeComparison;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.loadOrCreateKeyIv = loadOrCreateKeyIv;
exports.createEncryptorDecryptor = createEncryptorDecryptor;

/**
 * Create encryptor and decryptor functions using key loaded from entropy file.
 *
 * If entropy file doesn't exist creates new entropy and writes it to a file.
 * Makes sure that the file is created only once, by using exclusive file flag.
 *
 * If no `filePath` is given, creates new entropy without saving it.
 *
 * @param {string} [filePath] - an optional path to entropy file
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
    return encrypt(cipherKey, iv, hmacKey, data, callback);
  }

  function decryptor(dataEncrypted, callback) {
    return decrypt(cipherKey, iv, hmacKey, dataEncrypted, callback);
  }

  if (callback)
    callback(null, encryptor, decryptor);
  else
    return [encryptor, decryptor];
};

function loadOrCreateKeyIv(filePath, password, salt, callback) {
  if (!filePath)
    return createEntropyKeyIvHmac(password, salt, callback);

  var retries = 10;
  (function readEntropy(err) {

    if (err && retries-- <= 0)
      return callback(err);

    /* read entropy file */
    fs.readFile(filePath, function(err, entropy) {
      if (err && err.code !== 'ENOENT')
        return callback(err);

      if (entropy) {
        /* file exists */
        if (entropy.length === 80) {
          /* the size is right, resolve it */
          extractKeyIvHmac(entropy, callback);
        } else if (entropy.length === 0) {
          /* file is empty, some other process might be writing to it */
          setTimeout(readEntropy, 50, new Error("entropy file found but it's empty"));
        } else
          callback(new Error("entropy file has incorrect size"));
      } else {
        /* create file exclusively, create entropy, write entropy to a file */
        fs.open(filePath, 'wx', function(err, fd) {
          if (err)
            return err.code === 'EEXIST' ?
                setTimeout(readEntropy, 50, err) : callback(err);

          /* clean up file on error */
          function cleanup(err) {
            fs.close(fd, function() {
              fs.unlink(filePath, function() {
                callback(err);
              });
            });
          }

          /* create entropy */
          createEntropy(password, salt, function(err, entropy) {
            if (err) return cleanup(err);
            /* write entropy to a file */
            fs.write(fd, entropy, 0, entropy.length, function(err, written) {
              if (err) return cleanup(err);
              if (written != entropy.length)
                return cleanup(new Error("error writing entropy file"));
              fs.close(fd, function() {
                extractKeyIvHmac(entropy, callback);
              });
            });
          });
        })
      }
    });
  })();
};

function createEntropyKeyIvHmac(password, salt, callback) {
  createEntropy(password, salt, function(err, entropy) {
    if (err) return callback(err);
    extractKeyIvHmac(entropy, callback);
  });
}

function createEntropy(password, salt, callback) {
  password || (password = crypto.randomBytes(6));
  salt     || (salt     = crypto.randomBytes(64));

  crypto.pbkdf2(password, salt, config.entropyIterations, 80, config.entropyHmacAlgorithm, callback);
}

function extractKeyIvHmac(entropy, callback) {
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
    var cipher = crypto.createCipheriv(algorithm, cipherKey, iv)
      , signer = crypto.createHmac(config.signatureHmacAlgorithm, hmacKey)
  } catch(err) {
    if (callback) return callback(err);
    throw err;
  }

  if (callback) {
    cipher.end(data, function() {
      try {
        var cipherbody = cipher.read();
        signer.end(cipherbody, function() {
          var authbody = signer.read();
          callback(null, Buffer.concat([authbody, cipherbody]));
        });
      } catch(err) { return callback(err); }
    });
  } else {
    var cipherbody = cipher.update(data)
      , cipherpad = cipher.final()
      , authbody = signer.update(cipherbody).update(cipherpad).digest()
    return Buffer.concat([authbody, cipherbody, cipherpad]);
  }
};
// TODO make it synchronous also
function decrypt(cipherKey, iv, hmacKey, dataEncrypted, algorithm, callback) {
  if ('function' === typeof algorithm)
    callback = algorithm, algorithm = null;

  algorithm || (algorithm = config.cryptoAlgorithm);

  try {
    var authbody = dataEncrypted.slice(0, 32)
      , cipherbody = dataEncrypted.slice(32)
      , decipher = crypto.createDecipheriv(algorithm, cipherKey, iv)
      , signer = crypto.createHmac(config.signatureHmacAlgorithm, hmacKey)

  } catch(err) {
    if (callback) return callback(err);
    throw err;
  }

  if (callback) {
    signer.end(cipherbody, function() {
      var verify = signer.read();
      if (timingSafeComparison(verify, authbody)) {
        decipher.end(cipherbody, function() {
          try {
            var data = decipher.read();
          } catch(err) { return callback(err); }
          callback(null, data);
        });
      } else
        callback(null, null);
    });
  } else {
    var verify = signer.update(cipherbody).digest();
    if (timingSafeComparison(verify, authbody)) {
      var datapart = decipher.update(cipherbody)
        , datapad = decipher.final();
      return Buffer.concat([datapart, datapad]);
    } else
      return null;
  }
};

function timingSafeComparison(buf1, buf2) {
  var len = buf1.length;
  if (len !== buf2.length) {
    return false;
  }
  var result = 0;
  while (len-- > 0) {
    result |= buf1[len] ^ buf2[len];
  }
  return result === 0;
}
