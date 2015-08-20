/*
 * TEST crypt
 *
 * Author: Rafal Michalski (c) 2015
 */
var test = require("tap").test
var crypt = require("../../js/index").crypt;

var fs = require('fs');
var entropyFile = '.entropy.test.race.tmp';
function removeEntropyFile() {
  try { fs.unlinkSync(entropyFile) } catch(e) { }
}
removeEntropyFile();
process.on('exit', removeEntropyFile);

var entropy;

test("should create entropy file once", function(t) {
  t.plan(22);
  t.type(crypt.loadOrCreateKeyIv, 'function');
  crypt.loadOrCreateKeyIv(entropyFile, null, null, function(err, cipherKey, iv, hmacKey) {
    t.ifErr(err);
    t.type(cipherKey, Buffer);
    t.type(iv, Buffer);
    t.type(hmacKey, Buffer);
    t.equals(cipherKey.length + iv.length + hmacKey.length, 80);
    checkEntropy(cipherKey, iv, hmacKey);
  });
  crypt.loadOrCreateKeyIv(entropyFile, null, null, function(err, cipherKey, iv, hmacKey) {
    t.ifErr(err);
    t.type(cipherKey, Buffer);
    t.type(iv, Buffer);
    t.type(hmacKey, Buffer);
    t.equals(cipherKey.length + iv.length + hmacKey.length, 80);
    checkEntropy(cipherKey, iv, hmacKey);
  });
  setImmediate(crypt.loadOrCreateKeyIv, entropyFile, null, null, function(err, cipherKey, iv, hmacKey) {
    t.ifErr(err);
    t.type(cipherKey, Buffer);
    t.type(iv, Buffer);
    t.type(hmacKey, Buffer);
    t.equals(cipherKey.length + iv.length + hmacKey.length, 80);
    checkEntropy(cipherKey, iv, hmacKey);
  });

  function checkEntropy(cipherKey, iv, hmacKey) {
    if (entropy) {
      t.deepEquals(entropy[0], cipherKey);
      t.deepEquals(entropy[1], iv);
      t.deepEquals(entropy[2], hmacKey);
    } else {
      entropy = [cipherKey, iv, hmacKey];
    }
  }
});
