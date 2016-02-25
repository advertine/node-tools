/*
 * TEST mailer
 *
 * Author: Rafal Michalski (c) 2016
 */
var test = require("tap").test
var Promise = require('../../js/promise');
var nock = require('nock');

var mailer = require('../../js/mailer');

test("should be a function", function(t) {
  t.type(mailer.setup, 'function');
  t.type(mailer.sendEmail, 'function');
  mailer.setup({
    sendgrid:{user:'foo','key':'bar'},
    mail:{messages:'test'}
  }, function() {
    t.end();
  });
});

test("should send an email", function(t) {
  var args = {
    subject: "Była raz morska świnka mała...",
    poem: "Była raz morska świnka mała,\n\
Co gdy siedziała, to nie stała,\n\
Kiedy pościła, to nie jadła,\n\
A tyjąc, nie traciła sadła.\n",
    signature: "Yours truly"
  };


  var match = "\
----------------------------000000000000000000000000\r\nContent-Disposition: f\
orm-data; name=\"to\"\r\n\r\nanybody@anywhere\r\n----------------------------00\
0000000000000000000000\r\nContent-Disposition: form-data; name=\"from\"\r\n\r\n\
royal@advertine.com\r\n----------------------------000000000000000000000000\r\n\
Content-Disposition: form-data; name=\"x-smtpapi\"\r\n\r\n{}\r\n---------------\
-------------000000000000000000000000\r\nContent-Disposition: form-data; name=\"\
subject\"\r\n\r\nByła raz morska świnka mała...\r\n----------------------------\
000000000000000000000000\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\
\n\Była raz morska świnka mała...\n\nByła raz morska świnka mała,\nCo gdy siedz\
iała, to nie stała,\nKiedy pościła, to nie jadła,\nA tyjąc, nie traciła sadła.\n\
\n\n--\nYours truly\n\r\n----------------------------000000000000000000000000\r\
\nContent-Disposition: form-data; name=\"html\"\r\n\r\n\r\n--------------------\
--------000000000000000000000000\r\nContent-Disposition: form-data; name=\"head\
ers\"\r\n\r\n{\"From\":\"\\\"Rafal Michalski\\\" <royal@advertine.com>\"}\r\n--\
--------------------------000000000000000000000000\r\nContent-Disposition: form\
-data; name=\"api_user\"\r\n\r\nfoo\r\n----------------------------000000000000\
000000000000\r\nContent-Disposition: form-data; name=\"api_key\"\r\n\r\nbar\r\n\
----------------------------000000000000000000000000--\r\n";

  t.plan(3);

  var scope = nock('https://api.sendgrid.com')
  .matchHeader('content-type', /multipart\/form-data; boundary=--------------------------\d+/)
  .matchHeader('content-length', function(val) {
    return val >= 1300;
  })
  .replyContentLength()
  .filteringRequestBody(function(body) {
    t.strictEqual(body.replace(/\d{20,}/g, '000000000000000000000000'), match);
    return '*';
  })
  .post('/api/mail.send.json', '*')
  .reply(200, { "message": "success" });

  mailer.sendEmail('anybody@anywhere', 'email', args, function(err, response) {
    t.ifErr(err);
    t.deepEqual(response, { "message": "success" });
  });
});
