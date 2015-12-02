/*
 * TOOL regexp
 *
 * Author: Rafal Michalski (c) 2015
 */
var escapeRe = /[-\/\\^$*+?.()|[\]{}]/g;
exports.escape = function escape(string) {
  return string.replace(escapeRe, '\\$&');
};

exports.alwaysNegative = /^[^\u0000-\uffff]+$/;

