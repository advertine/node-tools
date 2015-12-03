/*
 * TEST domains
 *
 * Author: Rafal Michalski (c) 2015
 */
var test = require("tap").test
var domains = require("../../js/index").domains;

test("domains", function(suite) {

  suite.test("patternVerifyRegexp", function(t) {
    t.type(domains.patternVerifyRegexp, RegExp);

    t.test('should detect invalid domain names', function(t) {
      t.strictEqual(domains.patternVerifyRegexp.test(),                   true); // "undefined" is a valid domain name
      t.strictEqual(domains.patternVerifyRegexp.test(''),                 false);
      t.strictEqual(domains.patternVerifyRegexp.test('*'),                true);
      t.strictEqual(domains.patternVerifyRegexp.test('*:*'),              false);
      t.strictEqual(domains.patternVerifyRegexp.test('*:8888'),           false);
      t.strictEqual(domains.patternVerifyRegexp.test('foo'),              true);
      t.strictEqual(domains.patternVerifyRegexp.test('foo:*'),            true);
      t.strictEqual(domains.patternVerifyRegexp.test('foo:8888'),         true);
      t.strictEqual(domains.patternVerifyRegexp.test('foo:'),             false);
      t.strictEqual(domains.patternVerifyRegexp.test('foo:foo'),          false);
      t.strictEqual(domains.patternVerifyRegexp.test('.foo'),             true);
      t.strictEqual(domains.patternVerifyRegexp.test('*.foo'),            true);
      t.strictEqual(domains.patternVerifyRegexp.test('bar.foo'),          true);
      t.strictEqual(domains.patternVerifyRegexp.test('.bar.foo'),         true);
      t.strictEqual(domains.patternVerifyRegexp.test('*.bar.foo:*'),      true);
      t.strictEqual(domains.patternVerifyRegexp.test('*.bar.foo:777'),    true);
      t.strictEqual(domains.patternVerifyRegexp.test('*.bar.foo:'),       false);
      t.strictEqual(domains.patternVerifyRegexp.test('*.bar.foo:bar'),    false);
      t.strictEqual(domains.patternVerifyRegexp.test('**'),               false);
      t.strictEqual(domains.patternVerifyRegexp.test('*foo'),             false);
      t.strictEqual(domains.patternVerifyRegexp.test('foo*'),             false);
      t.strictEqual(domains.patternVerifyRegexp.test('*foo*'),            false);
      t.strictEqual(domains.patternVerifyRegexp.test('foo.*'),            false);
      t.strictEqual(domains.patternVerifyRegexp.test('.*'),               false);
      t.strictEqual(domains.patternVerifyRegexp.test('*.'),               false);
      t.strictEqual(domains.patternVerifyRegexp.test('foo.'),             false);
      t.strictEqual(domains.patternVerifyRegexp.test('.foo.'),            false);
      t.strictEqual(domains.patternVerifyRegexp.test('foo@'),             false);
      t.strictEqual(domains.patternVerifyRegexp.test('&foo'),             false);
      t.strictEqual(domains.patternVerifyRegexp.test('foo-bar.baz'),      true);
      t.strictEqual(domains.patternVerifyRegexp.test('foo-bar.baz:*'),    true);
      t.strictEqual(domains.patternVerifyRegexp.test('foo-bar.baz:6969'), true);
      t.strictEqual(domains.patternVerifyRegexp.test('foo-bar.baz:foo'),  false);
      t.end();
    });
    t.end();
  });

  suite.test("patternToRegexpString", function(t) {
    t.type(domains.patternToRegexpString, 'function');
    t.strictEqual(domains.patternToRegexpString.name, 'patternToRegexpString');
    t.strictEqual(domains.patternToRegexpString.length, 1);

    t.test('should convert site to domain regexp catcher', function(t) {
      t.strictEqual(domains.patternToRegexpString('*'),                    '(^.+$)');
      t.strictEqual(domains.patternToRegexpString('www.example.com'),      '(^www\\.example\\.com$)');
      t.strictEqual(domains.patternToRegexpString('www.example.com:6969'), '(^www\\.example\\.com:6969$)');
      t.strictEqual(domains.patternToRegexpString('.example.com'),         '(^example\\.com$|^.*\\.example\\.com$)');
      t.strictEqual(domains.patternToRegexpString('.example.com:8000'),    '(^example\\.com:8000$|^.*\\.example\\.com:8000$)');
      t.strictEqual(domains.patternToRegexpString('*.example.com'),        '(^.*\\.example\\.com$)');
      t.strictEqual(domains.patternToRegexpString('*.example.com:777'),    '(^.*\\.example\\.com:777$)');
      t.end();
    });
    t.end();
  });

  suite.test("patternCompare", function(t) {
    t.type(domains.patternCompare, 'function');
    t.strictEqual(domains.patternCompare.name, 'patternCompare');
    t.strictEqual(domains.patternCompare.length, 2);

    t.test('should select proper domain name order', function(t) {
      t.strictEqual(domains.patternCompare(                 '*','*')              ,  0);
      t.strictEqual(domains.patternCompare(                 '*','.example.com')   ,  1);
      t.strictEqual(domains.patternCompare(      '.example.com','*')              , -1);
      t.strictEqual(domains.patternCompare(   'www.example.com','www.example.com'),  0);
      t.strictEqual(domains.patternCompare(       'example.com','example.com')    ,  0);
      t.strictEqual(domains.patternCompare(      '.example.com','.example.com')   ,  0);
      t.strictEqual(domains.patternCompare(     '*.example.com','*.example.com')  ,  0);
      t.strictEqual(domains.patternCompare(     '*.example.com','.example.com')   , -1);
      t.strictEqual(domains.patternCompare(      '.example.com','*.example.com')  ,  1);
      t.strictEqual(domains.patternCompare(   'www.example.com','.example.com')   , -1);
      t.strictEqual(domains.patternCompare(   'www.example.com','*.example.com')  , -1);
      t.strictEqual(domains.patternCompare(      '.example.com','www.example.com'),  1);
      t.strictEqual(domains.patternCompare(     '*.example.com','www.example.com'),  1);
      t.strictEqual(domains.patternCompare(       'example.com','.example.com')   , -1);
      t.strictEqual(domains.patternCompare(      '.example.com','example.com')    ,  1);
      t.strictEqual(domains.patternCompare(   'www.example.com','*.example.com')  , -1);
      t.strictEqual(domains.patternCompare(          '.foo.bar','*.foo.bar')   ,     1);
      t.strictEqual(domains.patternCompare(           'www.bar','foo.bar')     ,     1);
      t.strictEqual(domains.patternCompare(           'foo.bar','*.foo.bar')   ,    -1);
      t.strictEqual(domains.patternCompare(         '*.foo.bar','foo.bar')     ,     1);
      t.strictEqual(domains.patternCompare(               'bar','bar')         ,     0);
      t.strictEqual(domains.patternCompare(              '.bar','bar')         ,     1);
      t.strictEqual(domains.patternCompare(               'bar','.bar')        ,    -1);
      t.strictEqual(domains.patternCompare(               'bar','*.bar')       ,    -1);
      t.strictEqual(domains.patternCompare(             '*.bar','bar')         ,     1);
      t.end();
    });

    t.test('should sort properly domain names', function(t) {
      var patterns = [
        '*',
        '.foo.bar',
        'foo.bar',
        '*.foo.bar',
        '.bleh.bla.com',
        '.bla.com',
        '*.bla.com',
        'a.bla.com',
        'bla.com',
        '*.bleh.bla.com',
        'a.bleh.bla.com',
        'bleh.bla.com',
        'foo.bar' ];

      t.deepEqual(patterns.sort(domains.patternCompare), [
        'foo.bar',
        'foo.bar',
        '*.foo.bar',
        '.foo.bar',
        'bla.com',
        'a.bla.com',
        'bleh.bla.com',
        'a.bleh.bla.com',
        '*.bleh.bla.com',
        '.bleh.bla.com',
        '*.bla.com',
        '.bla.com',
        '*']);
      t.end();
    });

    t.end();
  });

  suite.test('patternTest', function(t) {
    t.type(domains.patternTest, 'function');
    t.strictEqual(domains.patternTest.name, 'patternTest');
    t.strictEqual(domains.patternTest.length, 2);

    t.test('should tell if domain names matches and which is more global', function(t) {
      t.strictEqual(domains.patternTest(                 '*','*')              ,  0);
      t.strictEqual(domains.patternTest(                 '*','.example.com')   ,  1);
      t.strictEqual(domains.patternTest(      '.example.com','*')              , -1);
      t.strictEqual(domains.patternTest(   'www.example.com','www.example.com'),  0);
      t.strictEqual(domains.patternTest(       'example.com','example.com')    ,  0);
      t.strictEqual(domains.patternTest(      '.example.com','.example.com')   ,  0);
      t.strictEqual(domains.patternTest(     '*.example.com','*.example.com')  ,  0);
      t.strictEqual(domains.patternTest(     '*.example.com','.example.com')   , -1);
      t.strictEqual(domains.patternTest(      '.example.com','*.example.com')  ,  1);
      t.strictEqual(domains.patternTest(   'www.example.com','.example.com')   , -1);
      t.strictEqual(domains.patternTest(   'www.example.com','*.example.com')  , -1);
      t.strictEqual(domains.patternTest(      '.example.com','www.example.com'),  1);
      t.strictEqual(domains.patternTest(     '*.example.com','www.example.com'),  1);
      t.strictEqual(domains.patternTest(       'example.com','.example.com')   , -1);
      t.strictEqual(domains.patternTest(      '.example.com','example.com')    ,  1);
      t.strictEqual(domains.patternTest(   'www.example.com','*.example.com')  , -1);
      t.strictEqual(domains.patternTest(          '.foo.bar','*.foo.bar')   ,     1);
      t.strictEqual(domains.patternTest(           'www.bar','foo.bar')     , false);
      t.strictEqual(domains.patternTest(           'foo.bar','*.foo.bar')   , false);
      t.strictEqual(domains.patternTest(         '*.foo.bar','foo.bar')     , false);
      t.strictEqual(domains.patternTest(               'bar','bar')            ,  0);
      t.strictEqual(domains.patternTest(              '.bar','bar')            ,  1);
      t.strictEqual(domains.patternTest(               'bar','.bar')           , -1);
      t.strictEqual(domains.patternTest(          '.foo.com','*.com')          , -1);
      t.strictEqual(domains.patternTest(         '*.bar.com','*.com')          , -1);
      t.strictEqual(domains.patternTest(               'bar','*.bar')       , false);
      t.strictEqual(domains.patternTest(             '*.bar','bar')         , false);
      t.end();
    });
    t.end();
  });

  suite.test("createDomainMatcher", function(t) {
    t.type(domains.createDomainMatcher, 'function');
    t.strictEqual(domains.createDomainMatcher.name, 'createDomainMatcher');
    t.strictEqual(domains.createDomainMatcher.length, 2);

    t.test('should create empty matcher', function(t) {
      var matcher = domains.createDomainMatcher({});
      t.type(matcher, 'function');
      t.strictEqual(matcher.name, 'matcher');
      t.strictEqual(matcher.length, 2);

      t.strictEqual(matcher('www.foo.bar'), void(0));
      t.strictEqual(matcher('foo.bar'), void(0));
      t.strictEqual(matcher('fee.foo.bar'), void(0));
      t.strictEqual(matcher('zanzi.bar'), void(0));
      t.strictEqual(matcher('www.zanzi.bar'), void(0));
      t.strictEqual(matcher('bar.foo'), void(0));
      t.strictEqual(matcher('bar.foo', null), null);
      t.strictEqual(matcher('bar.foo', false), false);

      t.end();
    });

    t.test('should create matcher', function(t) {
      var matcher = domains.createDomainMatcher({
        'www.foo.bar': 1,
        '.zanzi.bar': 3,
        'foo.bar': 4,
        '*.foo.bar': 2
      });
      t.type(matcher, 'function');
      t.strictEqual(matcher.name, 'matcher');
      t.strictEqual(matcher.length, 2);

      t.strictEqual(matcher('www.foo.bar'), 1);
      t.strictEqual(matcher('foo.bar'), 4);
      t.strictEqual(matcher('fee.foo.bar'), 2);
      t.strictEqual(matcher('zanzi.bar'), 3);
      t.strictEqual(matcher('www.zanzi.bar'), 3);
      t.strictEqual(matcher('bar.foo'), void(0));
      t.strictEqual(matcher('bar.foo', null), null);
      t.strictEqual(matcher('bar.foo', false), false);

      t.end();
    });

    t.test('should create matcher with pattern validation', function(t) {
      var matcher = domains.createDomainMatcher({
        'www.foo.bar': 1,
        '.zanzi.bar': 3,
        'foo.bar': 4,
        '*.foo.bar': 2
      }, true);
      t.type(matcher, 'function');
      t.strictEqual(matcher.name, 'matcher');
      t.strictEqual(matcher.length, 2);
      t.throws(function() {
        domains.createDomainMatcher({
          'www.foo.bar': 1,
          '.zanzi.bar': 3,
          'foo.bar': 4,
          '*.foo.bar': 2,
          'foo bar': 42
        }, true);
      }, {
        message: "pattern: 'foo bar' is not a valid domain pattern"
      });

      t.end();
    });
    t.end();
  });
  suite.end();
});

