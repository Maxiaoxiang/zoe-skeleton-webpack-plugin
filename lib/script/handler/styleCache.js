'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addStyle = exports.shapeStyle = undefined;

var _config = require('../config');

var styleCache = new Map();

// some common styles
/**
 * a Map instance to cache the styles which will be inserted into the skeleton page.
 * key is the selector and value is the css rules.
 */
var shapeStyle = exports.shapeStyle = function shapeStyle(shape) {
  var selector = '.' + (_config.CLASS_NAME_PREFEX + shape);
  var rule = '{\n    border-radius: ' + (shape === 'rect' ? '0' : '50%') + ';\n  }';
  if (!styleCache.has(selector)) {
    styleCache.set(selector, rule);
  }
};

var addStyle = exports.addStyle = function addStyle(selector, rule) {
  if (!styleCache.has(selector)) {
    styleCache.set(selector, rule);
  }
};

exports.default = styleCache;