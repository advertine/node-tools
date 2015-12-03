/*
 * TOOL mailer
 *
 * Author: Rafal Michalski (c) 2015
 */
var fs = require('fs')
  , path = require('path');

var MailParser = require("mailparser").MailParser;

var sendgrid;

var reEscape = require('./index').regexp.escape;

var substitute = require('./index').interpolate.interpolate2;

var Cache  = require('./index').willy_cache
  , emails = new Cache()

var emailDirectory = path.resolve(path.join('views', 'emails'));

var debug = require('debug')('mailer');

var aliases = new Map();

/**
 * Setup mailer with setup config object.
 *
 * config options:
 *
 * - config.sendgrid.user: [required] a sendgrid user access login
 * - config.sendgrid.key: [required] a sendgrid user access key
 * - config.mail.aliases: object with keys as alias name and values as email addresses
 * - config.mail.messages: directory where message templates are stored
 * 
 * @param {Object} config
 * @param {Function} callback
**/
exports.setup = function(config, callback) {
  var options = config.sendgrid;
  try {

    if (config.mail.aliases && 'object' === typeof config.mail.aliases) {
      var newaliases = config.mail.aliases;
      Object.keys(newaliases).forEach(function(alias) {
        var email = newaliases[alias];
        debug("new alias: %s: %s", alias, email);
        aliases.set(alias, email);
      });
    }

    if ('string' === typeof config.mail.messages) {
      emailDirectory = path.resolve(config.mail.messages);
      debug("email directory: %s", emailDirectory);
    }

    sendgrid = require('sendgrid')(options.user, options.key);

  } catch(err) { return callback(err) }

  setImmediate(callback, null);
};

function resolveRecipientAlias(alias) {
  return aliases.get(alias) || alias;
}

/**
 * Send email message via sendgrid.
 *
 * @param {string} to - email or alias
 * @param {string} emailType - a file emailType + ".msg" will be loaded and cached from config.messages directory
 * @param {Object} args - arguments to substitute inside email body
 * @param {Function} callback - a result function(err, status)
**/
exports.sendEmail = function(to, emailType, args, callback) {

  to = resolveRecipientAlias(to);

  debug('about to send email: %s to %s', emailType, to);
  instantiateEmail(emailType, args, function(err, from, headerFrom, subject, body) {
    if (err) return callback(err);

    var email = new sendgrid.Email({
      to:       to,
      from:     from,
      subject:  subject,
      text:     body
    });

    debug(email);

    //email.addHeader('From', headerFrom);

    sendgrid.send(email, callback);
  });
};

function instantiateEmail(name, args, callback) {
  ensureEmail(name, function(err, email) {
    if (err) return callback(err);

    var body;

    try {
      body = substitute(email.text, args);
    } catch(e) {
      return callback(e);
    }
 
    callback(null, email.from[0].address, email.headers.from, email.subject, body);
  });
}

function ensureEmail(name, callback) {
  emails.getOrWillSet(name, function(next) {
    mailparser = new MailParser();
    mailparser.on("end", function(email) {
      next(null, email);
    });
    fs.createReadStream(path.join(emailDirectory, name + ".msg"))
      .on('error', next)
      .pipe(mailparser);
  }, callback);
}
