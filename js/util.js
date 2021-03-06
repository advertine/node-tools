/*
 * TOOL util
 *
 * Author: Rafal Michalski (c) 2015-2016
 */
"use strict";

var proto = Object.prototype;
var toString = proto.toString;
var getPrototypeOf = Object.getPrototypeOf;

/**
 * undefined type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isUndefined(arg) {
  return arg === undefined;
}

/**
 * null type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isNull(arg) {
  return arg === null;
}

/**
 * null or undefined type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isNullOrUndefined(arg) {
  return arg === null || arg === undefined;
}

/**
 * Boolean type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isBoolean(arg) {
  return typeof arg === 'boolean';
}

/**
 * Number type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isNumber(arg) {
  return typeof arg === 'number';
}

/**
 * String type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isString(arg) {
  return typeof arg === 'string';
}

/**
 * Symbol type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isSymbol(arg) {
  return typeof arg === 'symbol';
}

/**
 * Object type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isObject(arg) {
  return arg !== null && typeof arg === 'object';
}

/**
 * Strict object type check. Only returns `true`
 * for plain JavaScript objects that have only Object.prototype or null in its prototype chain.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isPlainObject(value) {
  return value != null && ((value = getPrototypeOf(value)) === proto || value === null);
}

/**
 * Error type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isError(e) {
  return toString(e) === '[object Error]' || e instanceof Error;
}

/**
 * Array type check.
 *
 * @param  mixed   data The value to check.
 * @return Boolean
 */
function isTypedArray(value) {
  return !!(value && value.constructor && value.constructor.BYTES_PER_ELEMENT > 0);
}

/**
 * Date type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isDate(value) {
  return toString.call(value) === "[object Date]";
};
// function isDate(d) {
//   return binding.isDate(d);
// }


/**
 * RegExp type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isRegExp(value) {
  return toString.call(value) === "[object RegExp]";
};
// function isRegExp(re) {
//   return binding.isRegExp(re);
// }

/**
 * RegExp type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isFunction(arg) {
  return typeof arg === 'function';
}

/**
 * Primitive type check.
 *
 * @param  mixed   value The value to check.
 * @return Boolean
 */
function isPrimitive(arg) {
  return arg === null ||
         typeof arg !== 'object' && typeof arg !== 'function';
}

module.exports = {
  isArray:           Array.isArray,
  isBoolean:         isBoolean,
  isBuffer:          Buffer.isBuffer,
  isDate:            isDate,
  isError:           isError,
  isFunction:        isFunction,
  isNull:            isNull,
  isNullOrUndefined: isNullOrUndefined,
  isNumber:          isNumber,
  isObject:          isObject,
  isPlainObject:     isPlainObject,
  isPrimitive:       isPrimitive,
  isRegExp:          isRegExp,
  isScalar:          isPrimitive,
  isString:          isString,
  isSymbol:          isSymbol,
  isTypedArray:      isTypedArray,
  isUndefined:       isUndefined
};
