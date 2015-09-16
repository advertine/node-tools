/*
 * TEST intervals
 *
 * Author: Rafal Michalski (c) 2015
 */
var test = require("tap").test
var intervals = require("../../js/index").intervals;
var parseIntervalMs = intervals.parseIntervalMs;

test("should have functions", function(t) {
  t.type(parseIntervalMs, 'function');
  t.equal(parseIntervalMs.length, 2);
  t.end();
});

test("should not parse intervals", function(t) {
  t.throws(function(){parseIntervalMs()});
  t.throws(function(){parseIntervalMs(null)});
  t.throws(function(){parseIntervalMs(false)});
  t.throws(function(){parseIntervalMs(true)});
  t.throws(function(){parseIntervalMs(void(0))});
  t.throws(function(){parseIntervalMs({})});
  t.throws(function(){parseIntervalMs([])});
  t.throws(function(){parseIntervalMs(new Date())});
  t.throws(function(){parseIntervalMs("")});
  t.throws(function(){parseIntervalMs("foo")});
  t.throws(function(){parseIntervalMs(/foo/)});
  t.throws(function(){parseIntervalMs(" ")});
  t.end();
});

test("should return default", function(t) {
  t.strictEqual(parseIntervalMs(null, 0), 0);
  t.strictEqual(parseIntervalMs(false, -1), -1);
  t.throws(function(){parseIntervalMs(true, 1)});
  t.strictEqual(parseIntervalMs(void(0), 2), 2);
  t.throws(function(){parseIntervalMs({}, 3)});
  t.throws(function(){parseIntervalMs([], 4)});
  t.throws(function(){parseIntervalMs(new Date(), 5)});
  t.strictEqual(parseIntervalMs("", 6), 6);
  t.throws(function(){parseIntervalMs("foo", 7)});
  t.throws(function(){parseIntervalMs(/foo/, 8)});
  t.throws(function(){parseIntervalMs(" ", 9)});
  t.end();
});


test("should parse intervals", function(t) {
  t.strictEqual(parseIntervalMs(42),                  42);
  t.strictEqual(parseIntervalMs('42'),                42);
  t.strictEqual(parseIntervalMs('42  '),              42);
  t.strictEqual(parseIntervalMs('42ms'),              42);
  t.strictEqual(parseIntervalMs('42millis'),          42);
  t.strictEqual(parseIntervalMs('42milliseconds'),    42);
  t.strictEqual(parseIntervalMs('42 ms'),             42);
  t.strictEqual(parseIntervalMs('42  millis'),        42);
  t.strictEqual(parseIntervalMs('42   milliseconds'), 42);
  t.strictEqual(parseIntervalMs('42s'),               42*1000);
  t.strictEqual(parseIntervalMs('42sec'),             42*1000);
  t.strictEqual(parseIntervalMs('42secs'),            42*1000);
  t.strictEqual(parseIntervalMs('42second'),          42*1000);
  t.strictEqual(parseIntervalMs('42seconds'),         42*1000);
  t.strictEqual(parseIntervalMs('42 s'),              42*1000);
  t.strictEqual(parseIntervalMs('42  sec'),           42*1000);
  t.strictEqual(parseIntervalMs('42   secs'),         42*1000);
  t.strictEqual(parseIntervalMs('42    second'),      42*1000);
  t.strictEqual(parseIntervalMs('42     seconds'),    42*1000);
  t.strictEqual(parseIntervalMs('42m'),               42*1000*60);
  t.strictEqual(parseIntervalMs('42min'),             42*1000*60);
  t.strictEqual(parseIntervalMs('42mins'),            42*1000*60);
  t.strictEqual(parseIntervalMs('42minute'),          42*1000*60);
  t.strictEqual(parseIntervalMs('42minutes'),         42*1000*60);
  t.strictEqual(parseIntervalMs('42 m'),              42*1000*60);
  t.strictEqual(parseIntervalMs('42  min'),           42*1000*60);
  t.strictEqual(parseIntervalMs('42   mins'),         42*1000*60);
  t.strictEqual(parseIntervalMs('42    minute'),      42*1000*60);
  t.strictEqual(parseIntervalMs('42     minutes'),    42*1000*60);
  t.strictEqual(parseIntervalMs('42h'),               42*1000*60*60);
  t.strictEqual(parseIntervalMs('42hour'),            42*1000*60*60);
  t.strictEqual(parseIntervalMs('42hours'),           42*1000*60*60);
  t.strictEqual(parseIntervalMs('42h'),               42*1000*60*60);
  t.strictEqual(parseIntervalMs('42hour'),            42*1000*60*60);
  t.strictEqual(parseIntervalMs('42hours'),           42*1000*60*60);
  t.strictEqual(parseIntervalMs('42 h'),              42*1000*60*60);
  t.strictEqual(parseIntervalMs('42  hour'),          42*1000*60*60);
  t.strictEqual(parseIntervalMs('42   hours'),        42*1000*60*60);
  t.strictEqual(parseIntervalMs('42d'),               42*1000*60*60*24);
  t.strictEqual(parseIntervalMs('42day'),             42*1000*60*60*24);
  t.strictEqual(parseIntervalMs('42days'),            42*1000*60*60*24);
  t.strictEqual(parseIntervalMs('42d'),               42*1000*60*60*24);
  t.strictEqual(parseIntervalMs('42day'),             42*1000*60*60*24);
  t.strictEqual(parseIntervalMs('42days'),            42*1000*60*60*24);
  t.strictEqual(parseIntervalMs('42 d'),              42*1000*60*60*24);
  t.strictEqual(parseIntervalMs('42  day'),           42*1000*60*60*24);
  t.strictEqual(parseIntervalMs('42   days'),         42*1000*60*60*24);
  t.strictEqual(parseIntervalMs('42w'),               42*1000*60*60*24*7);
  t.strictEqual(parseIntervalMs('42week'),            42*1000*60*60*24*7);
  t.strictEqual(parseIntervalMs('42weeks'),           42*1000*60*60*24*7);
  t.strictEqual(parseIntervalMs('42w'),               42*1000*60*60*24*7);
  t.strictEqual(parseIntervalMs('42week'),            42*1000*60*60*24*7);
  t.strictEqual(parseIntervalMs('42weeks'),           42*1000*60*60*24*7);
  t.strictEqual(parseIntervalMs('42 w'),              42*1000*60*60*24*7);
  t.strictEqual(parseIntervalMs('42  week'),          42*1000*60*60*24*7);
  t.strictEqual(parseIntervalMs('42   weeks'),        42*1000*60*60*24*7);
  t.end();
});

test("should parse float intervals", function(t) {
  t.strictEqual(parseIntervalMs(42.5),                  42);
  t.strictEqual(parseIntervalMs('42.5'),                42);
  t.strictEqual(parseIntervalMs('42.5  '),              42);
  t.strictEqual(parseIntervalMs('42.5ms'),              42);
  t.strictEqual(parseIntervalMs('42.5millis'),          42);
  t.strictEqual(parseIntervalMs('42.5milliseconds'),    42);
  t.strictEqual(parseIntervalMs('42.5 ms'),             42);
  t.strictEqual(parseIntervalMs('42.5  millis'),        42);
  t.strictEqual(parseIntervalMs('42.5   milliseconds'), 42);
  t.strictEqual(parseIntervalMs('42.5s'),               42*1000+500);
  t.strictEqual(parseIntervalMs('42.5sec'),             42*1000+500);
  t.strictEqual(parseIntervalMs('42.5secs'),            42*1000+500);
  t.strictEqual(parseIntervalMs('42.5second'),          42*1000+500);
  t.strictEqual(parseIntervalMs('42.5seconds'),         42*1000+500);
  t.strictEqual(parseIntervalMs('42.5 s'),              42*1000+500);
  t.strictEqual(parseIntervalMs('42.5  sec'),           42*1000+500);
  t.strictEqual(parseIntervalMs('42.5   secs'),         42*1000+500);
  t.strictEqual(parseIntervalMs('42.5    second'),      42*1000+500);
  t.strictEqual(parseIntervalMs('42.5     seconds'),    42*1000+500);
  t.strictEqual(parseIntervalMs('42.5m'),               (42*1000+500)*60);
  t.strictEqual(parseIntervalMs('42.5min'),             (42*1000+500)*60);
  t.strictEqual(parseIntervalMs('42.5mins'),            (42*1000+500)*60);
  t.strictEqual(parseIntervalMs('42.5minute'),          (42*1000+500)*60);
  t.strictEqual(parseIntervalMs('42.5minutes'),         (42*1000+500)*60);
  t.strictEqual(parseIntervalMs('42.5 m'),              (42*1000+500)*60);
  t.strictEqual(parseIntervalMs('42.5  min'),           (42*1000+500)*60);
  t.strictEqual(parseIntervalMs('42.5   mins'),         (42*1000+500)*60);
  t.strictEqual(parseIntervalMs('42.5    minute'),      (42*1000+500)*60);
  t.strictEqual(parseIntervalMs('42.5     minutes'),    (42*1000+500)*60);
  t.strictEqual(parseIntervalMs('42.5h'),               (42*1000+500)*60*60);
  t.strictEqual(parseIntervalMs('42.5hour'),            (42*1000+500)*60*60);
  t.strictEqual(parseIntervalMs('42.5hours'),           (42*1000+500)*60*60);
  t.strictEqual(parseIntervalMs('42.5h'),               (42*1000+500)*60*60);
  t.strictEqual(parseIntervalMs('42.5hour'),            (42*1000+500)*60*60);
  t.strictEqual(parseIntervalMs('42.5hours'),           (42*1000+500)*60*60);
  t.strictEqual(parseIntervalMs('42.5 h'),              (42*1000+500)*60*60);
  t.strictEqual(parseIntervalMs('42.5  hour'),          (42*1000+500)*60*60);
  t.strictEqual(parseIntervalMs('42.5   hours'),        (42*1000+500)*60*60);
  t.strictEqual(parseIntervalMs('42.5d'),               (42*1000+500)*60*60*24);
  t.strictEqual(parseIntervalMs('42.5day'),             (42*1000+500)*60*60*24);
  t.strictEqual(parseIntervalMs('42.5days'),            (42*1000+500)*60*60*24);
  t.strictEqual(parseIntervalMs('42.5d'),               (42*1000+500)*60*60*24);
  t.strictEqual(parseIntervalMs('42.5day'),             (42*1000+500)*60*60*24);
  t.strictEqual(parseIntervalMs('42.5days'),            (42*1000+500)*60*60*24);
  t.strictEqual(parseIntervalMs('42.5 d'),              (42*1000+500)*60*60*24);
  t.strictEqual(parseIntervalMs('42.5  day'),           (42*1000+500)*60*60*24);
  t.strictEqual(parseIntervalMs('42.5   days'),         (42*1000+500)*60*60*24);
  t.strictEqual(parseIntervalMs('42.5w'),               (42*1000+500)*60*60*24*7);
  t.strictEqual(parseIntervalMs('42.5week'),            (42*1000+500)*60*60*24*7);
  t.strictEqual(parseIntervalMs('42.5weeks'),           (42*1000+500)*60*60*24*7);
  t.strictEqual(parseIntervalMs('42.5w'),               (42*1000+500)*60*60*24*7);
  t.strictEqual(parseIntervalMs('42.5week'),            (42*1000+500)*60*60*24*7);
  t.strictEqual(parseIntervalMs('42.5weeks'),           (42*1000+500)*60*60*24*7);
  t.strictEqual(parseIntervalMs('42.5 w'),              (42*1000+500)*60*60*24*7);
  t.strictEqual(parseIntervalMs('42.5  week'),          (42*1000+500)*60*60*24*7);
  t.strictEqual(parseIntervalMs('42.5   weeks'),        (42*1000+500)*60*60*24*7);
  t.end();
});
