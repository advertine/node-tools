/*
 * TEST regexp
 *
 * Author: Rafal Michalski (c) 2015
 */
var test = require("tap").test
var regexp = require("../../js/index").regexp;

test("escape", function(suite) {

  suite.test("should be a function", function(t) {
    t.type(regexp.escape, 'function');
    t.strictEqual(regexp.escape.name, 'escape');
    t.strictEqual(regexp.escape.length, 1);
    t.end();
  });

  suite.test("should escape strings for regexp", function(t) {
    t.strictEqual(regexp.escape(''), '');
    t.strictEqual(regexp.escape(' '), ' ');
    t.strictEqual(regexp.escape('foo'), 'foo');
    t.strictEqual(regexp.escape('foo.bar'), 'foo\\.bar');
    t.strictEqual(regexp.escape('foo-/\\^$*+?.()|[]{}bar'), 'foo\\-\\/\\\\\\^\\$\\*\\+\\?\\.\\(\\)\\|\\[\\]\\{\\}bar');
    t.end();
  });

  suite.end();
});

test("alwaysNegative", function(t) {
  t.type(regexp.alwaysNegative, RegExp);
  t.strictEqual(regexp.alwaysNegative.test(), false);
  t.strictEqual(regexp.alwaysNegative.test(''), false);
  t.strictEqual(regexp.alwaysNegative.test(' '), false);
  t.strictEqual(regexp.alwaysNegative.test('\n'), false);
  t.strictEqual(regexp.alwaysNegative.test('\x00'), false);
  for(var i = 0; i <= 0xffff; ++i)
    t.strictEqual(regexp.alwaysNegative.test(String.fromCharCode(i)), false);
  t.end();
});
