/*
 * TEST interpolate
 *
 * Author: Rafal Michalski (c) 2015
 */
var test = require("tap").test
var interpolate = require("../../js/index").interpolate;

test("should have functions", function(t) {
  t.type(interpolate.interpolate2, 'function');
  t.equal(interpolate.interpolate2.length, 3);
  t.end();
});

test("should interpolate values", function(t) {
  var pattern1 = "There is a ${animal} in the barn. There are ${stats.count} ${animal}s in the barn";

  t.strictEqual(interpolate.interpolate2(pattern1, {
    animal: "cow",
    stats: {count: 2}
  }), "There is a cow in the barn. There are 2 cows in the barn");

  t.strictEqual(interpolate.interpolate2(pattern1),
    "There is a null in the barn. There are null nulls in the barn");

  t.strictEqual(interpolate.interpolate2(pattern1, null, "(not found)"),
    "There is a (not found) in the barn. There are (not found) (not found)s in the barn");

  t.strictEqual(interpolate.interpolate2(pattern1, null, ""),
    "There is a  in the barn. There are  s in the barn");

  t.strictEqual(interpolate.interpolate2(pattern1, {animal: "pig"}, "none"),
    "There is a pig in the barn. There are none pigs in the barn");

  t.strictEqual(interpolate.interpolate2(pattern1, {animal: ""}, "none"),
    "There is a  in the barn. There are none s in the barn");

  t.end();
});
