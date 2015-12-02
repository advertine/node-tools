/*
 * TOOL domains
 *
 * Author: Rafal Michalski (c) 2015
 */
var regexpEscape = require('./regexp').escape;
var alwaysNegativeRegexp = require('./regexp').alwaysNegative;

var patternVerifyRegexp = exports.patternVerifyRegexp = /^(\*$|^(?:\*\.|\.)?(?:[a-z0-9_-]+\.)*[a-z]+)(?:\:(\*|\d+))?$/;

exports.patternToRegexpString = patternToRegexpString;
exports.patternCompare        = patternCompare;
exports.patternTest           = patternTest;
exports.createDomainMatcher   = createDomainMatcher;

/**
 * Return site's domain pattern as regexp string
 *
 * @param {String} pattern
 *
 * @return {String}
 */
function patternToRegexpString(pattern) {
  if (pattern === '*') {
    return '(^.+$)';
  } else if (pattern[0] === '.') {
    return '(^' + regexpEscape(pattern.substr(1)) + '$|^.*' + regexpEscape(pattern) + '$)';
  } else if (pattern.substr(0, 2) === '*.') {
    return '(^.*' + regexpEscape(pattern.substr(1)) + '$)';
  } else {
    return '(^' + regexpEscape(pattern) + '$)';
  }
};

/**
 * Compare domain patterns.
 *
 * Made for with sort(). Will order according to example:
 *
 * ['www.example.com', '*.example.com', 'example.com', '.example.com', '*']
 *
 * @param {String} domA
 * @param {String} domB
 *
 * @return {number}
 */
function patternCompare(domA, domB) {
  if (domA === domB) {
    return 0;
  } else if (domA === '*') {
    return 1;
  } else if (domB === '*') {
    return -1;
  } else {
    var lastIndexA, lastIndexB
      , partA, partB
      , dotIndexA = domA.length
      , dotIndexB = domB.length

    do {
      lastIndexA = dotIndexA - 1;
      lastIndexB = dotIndexB - 1;
      dotIndexA = lastIndexA < 0 ? -1 : domA.lastIndexOf('.', lastIndexA);
      dotIndexB = lastIndexB < 0 ? -1 : domB.lastIndexOf('.', lastIndexB);
      partA = domA.substring(dotIndexA + 1, lastIndexA + 1);
      partB = domB.substring(dotIndexB + 1, lastIndexB + 1);
      if (partA === '') {
        return 1;
      } else if (partB === '') {
        return -1;
      } else if (partA === '*') {
        return 1;
      } else if (partB === '*') {
        return -1;
      } else if (partA < partB) {
        return -1;
      } else if (partA > partB) {
        return 1;
      }
    } while(dotIndexA >= 0 && dotIndexB >=0);
    return dotIndexA < 0 ? -1 : 1;
  }
};

/**
 * Test domain pattern against pattern or domain.
 *
 *   returns:
 *
 *   0    (=) when domA is identical to domB
 *   1    (>) when domA partially matches domB (but is wider)
 *  -1    (<) when domA is included in domB
 *  false (!) when domA doesn't match domB at all
 *
 *  e.g.:
 *                  * = *
 *                  * > .example.com
 *       .example.com < *
 *    www.example.com = www.example.com
 *       .example.com = .example.com
 *      *.example.com < .example.com
 *    www.example.com < .example.com
 *    www.example.com < *.example.com
 *        example.com < .example.com
 *            www.bar ! foo.bar
 *            foo.bar ! *.foo.bar
 *           .foo.bar > *.foo.bar
 *
 * @param {String} domA
 * @param {String} domB
 *
 * @return {number|false}
 */

/*
   returns

   0    (=) when domA is identical to domB
   1    (>) when domA partially matches domB (but is wider)
  -1    (<) when domA is included in domB
  false (!) when domA doesn't match domB at all
                  * ~= *
                  * ~> .example.com
       .example.com ~< *
    www.example.com ~= www.example.com
       .example.com ~= .example.com
      *.example.com ~< .example.com
    www.example.com ~< .example.com
    www.example.com ~< *.example.com
        example.com ~< .example.com
            www.bar ~! foo.bar
            foo.bar ~! *.foo.bar
           .foo.bar ~> *.foo.bar
*/
function patternTest(domA, domB) {
  if (domA == domB) { // redundant, speed up check
    return 0;
  } else {
    var lastIndexA, lastIndexB
      , partA, partB
      , dotIndexA = domA.length
      , dotIndexB = domB.length

    do {
      lastIndexA = dotIndexA - 1;
      lastIndexB = dotIndexB - 1;
      dotIndexA = lastIndexA < 0 ? -1 : domA.lastIndexOf('.', lastIndexA);
      dotIndexB = lastIndexB < 0 ? -1 : domB.lastIndexOf('.', lastIndexB);
      partA = lastIndexA < dotIndexA ? null : domA.substring(dotIndexA + 1, lastIndexA + 1);
      partB = lastIndexB < dotIndexB ? null : domB.substring(dotIndexB + 1, lastIndexB + 1);
      if (partA !== partB) {
        if (partA === '') {
          return 1;
        } else if (partB === '') {
          return -1;
        } else if (partA === null || partB === null) {
          return false;
        } else if (partA === '*') {
          return 1;
        } else if (partB === '*') {
          return -1;
        } else {
          return false;
        }
      }
    } while(dotIndexA >= 0 || dotIndexB >=0);
    return 0; // we'll never get here
  }
};

/**
 * Return function that finds value for the given domain name matching best
 * pattern from given pattern map (pattern -> value).
 *
 * @param {Object} patternMap
 * @param {Boolean} validatePatterns
 *
 * @return {Function} matcher(testString, defaultValue)
 */
function createDomainMatcher(patternMap, validatePatterns) {

  var regexp
    , values = []
    , patterns = Object.keys(patternMap).sort(patternCompare)

  if (patterns.length > 0) {
    regexp = new RegExp(patterns.map(function(pattern) {
      if (validatePatterns && !patternVerifyRegexp.test(pattern))
        throw new Error("pattern: '" + pattern + "' is not a valid domain pattern");

      values.push(patternMap[pattern]);
      return patternToRegexpString(pattern);
    }).join("|"));
  } else
    regexp = alwaysNegativeRegexp;

  function matcher(testString, defaultValue) {
    var index, match = regexp.exec(testString);
    if (match) {
      index = match.indexOf(match[0], 1);
      if (index > 0)
        return values[index - 1];
    }
    return defaultValue;
  }

  matcher.regexp = regexp;
  matcher.values = values;
  matcher.patterns = patterns;

  return matcher;
};
