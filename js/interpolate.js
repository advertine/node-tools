/*
 * TOOL interpolate
 *
 * Author: Rafal Michalski (c) 2015
 */
var defaultNull = String(null)
  , patternRe2 = /\$\{(?:(\w+)\.)?(\w+)\}/g;

/**
 * Interpolate string with supplied data.
 *
 * The interpolation pattern is ${foo} or nested (2nd level) ${foo.bar}.
 *
 * If the property value is not defined or is null the nullValue string is used.
 *
 * @param {string} pattern
 * @param {Object} data
 * @param {string} [nullValue] - defaults to "null"
 * @return {number}
**/
exports.interpolate2 = function interpolate(pattern, data, nullValue) {

  if (data == null)
    data = {};

  if ('object' !== typeof data)
    throw new TypeError("interpolate expects data as object");

  if ('string' !== typeof pattern)
    pattern = String(pattern);

  if (nullValue == null)
    nullValue = defaultNull;

  if ('string' !== typeof nullValue)
    nullValue = String(nullValue);

  return pattern.replace(patternRe2, function(_, level1, property) {
    var repl = level1 ? data[level1] : data;
    if (repl != null)
      repl = repl[property];
    return repl != null ? repl : nullValue;
  });
};
