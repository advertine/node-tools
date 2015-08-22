/*
 * TEST crypt
 *
 * Author: Rafal Michalski (c) 2015
 */
var test = require("tap").test
var crypt = require("../../js/index").crypt;

var fs = require('fs');
var entropyFile = '.entropy.test.tmp';
function removeEntropyFile() {
  try { fs.unlinkSync(entropyFile) } catch(e) { }
}
removeEntropyFile();
process.on('exit', removeEntropyFile);

var testdata = {
  plain: new Buffer('Ala ma kota, a kot ma Alę'),
}

test("should create entropy file and encryptor, decryptor pair", function(t) {
  t.plan(17);
  t.type(crypt.loadOrCreateEncryptorDecryptor, 'function');
  crypt.loadOrCreateEncryptorDecryptor(entropyFile, null, null, function(err, enc, dec) {
    t.ifErr(err);
    t.type(enc, 'function');
    t.type(dec, 'function');
    
    var encdata = enc(testdata.plain);
    t.type(encdata, Buffer);
    t.notDeepEqual(encdata, testdata.plain);
    t.notEqual(encdata.length, testdata.plain.length);
    var vrfydata = dec(encdata);
    t.type(vrfydata, Buffer);
    t.deepEqual(vrfydata, testdata.plain);
    testdata.encrypted = encdata;

    enc(testdata.plain, function(err, encdata) {
      t.ifErr(err);
      t.type(encdata, Buffer);
      t.notDeepEqual(encdata, testdata.plain);
      t.notEqual(encdata.length, testdata.plain.length);
      t.deepEqual(encdata, testdata.encrypted);
      dec(encdata, function(err, vrfydata) {
        t.ifErr(err);
        t.type(vrfydata, Buffer);
        t.deepEqual(vrfydata, testdata.plain);
      });
    })
  });
});

test("should create encryptor, decryptor pair from entropy file", function(t) {
  t.plan(19);
  t.type(crypt.loadOrCreateEncryptorDecryptor, 'function');
  crypt.loadOrCreateEncryptorDecryptor(entropyFile, null, null, function(err, enc, dec) {
    t.ifErr(err);
    t.type(enc, 'function');
    t.type(dec, 'function');

    var encdata = enc(testdata.plain);
    t.type(encdata, Buffer);
    t.notDeepEqual(encdata, testdata.plain);
    t.notEqual(encdata.length, testdata.plain.length);
    t.deepEqual(encdata, testdata.encrypted);
    var vrfydata = dec(encdata);
    t.type(vrfydata, Buffer);
    t.deepEqual(vrfydata, testdata.plain);

    enc(testdata.plain, function(err, encdata) {
      t.ifErr(err);
      t.type(encdata, Buffer);
      t.notDeepEqual(encdata, testdata.plain);
      t.notEqual(encdata.length, testdata.plain.length);
      t.deepEqual(encdata, testdata.encrypted);
      t.equal(encdata.length, testdata.encrypted.length);
      dec(testdata.encrypted, function(err, vrfydata) {
        t.ifErr(err);
        t.type(vrfydata, Buffer);
        t.deepEqual(vrfydata, testdata.plain);
      });
    })
  });
});
