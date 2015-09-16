/*
 * TOOL intervals
 *
 * Author: Rafal Michalski (c) 2015
 */
var intervalRe = /^\s*(\-?\d*(?:\.\d+)?)\s*(millis(?:econds)?|ms|s(?:ec(?:ond)?s?)?|m(?:in(?:ute)?s?)?|h(?:ours?)?|d(?:ays?)?|w(?:eeks?)?)?\.?$/i;

/**
 * Interpret string as millisecond time interval.
 *
 * examples:
 *
 * 10, "10", "10 ms", "10millis" => 10
 * "1 sec", "1 second", "1s"  => 1000
 * "2 min", "2 minutes", "2m" => 2*1000*60
 * "3 hour", "3 hours", "3h"  => 3*1000*60*60
 * "4 day", "4 days", "4d"    => 4*1000*60*60*24
 * "5 week", "5 weeks", "5w"  => 5*1000*60*60*24*7
 *
 * If defaultInterval is given it is returned on falsish interval.
 * Otherwise error is thrown.
 *
 * Throws error when interval is not a string, number or can't be interpreted.
 * 
 * @param {string|number} interval
 * @param {number} [defaultInterval]
 * @return {number}
**/
exports.parseIntervalMs = function(interval, defaultInterval) {
  if (!interval && arguments.length > 1)
    return defaultInterval;

  switch(typeof interval) {
    case 'number':
      return parseInt(interval);
    case 'string':
      var match = interval.match(intervalRe);
      if (match) {
        interval = parseFloat(match[1]);
        if (!isNaN(interval)) {
          switch(match[2] || '') {
            case 'ms':
            case 'millis':
            case 'milliseconds':
            case '':
              return parseInt(interval);
            case 's':
            case 'sec':
            case 'secs':
            case 'second':
            case 'seconds':
              return parseInt(interval*1000);
            case 'm':
            case 'min':
            case 'mins':
            case 'minute':
            case 'minutes':
              return parseInt(interval*60000);
            case 'h':
            case 'hour':
            case 'hours':
              return parseInt(interval*3600000);
            case 'd':
            case 'day':
            case 'days':
              return parseInt(interval*86400000);
            case 'w':
            case 'week':
            case 'weeks':
              return parseInt(interval*604800000);
          }
        }
      }
  }
  throw new Error("Can't parse interval: " + interval);
};
