'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _styleCache = require('./styleCache');

var _config = require('../config');

/**
 * [buttonHandler 改变 button 元素样式：包括去除 border和 box-shadow, 背景色和文字颜色统一]
 */
function buttonHandler(ele, _ref) {
  var color = _ref.color,
      excludes = _ref.excludes;

  if (excludes.indexOf(ele) > -1) return false;
  var classname = _config.CLASS_NAME_PREFEX + 'button';
  var rule = '{\n    color: ' + color + ' !important;\n    background: ' + color + ' !important;\n    border: none !important;\n    box-shadow: none !important;\n  }';
  (0, _styleCache.addStyle)('.' + classname, rule);
  ele.classList.add(classname);
}

exports.default = buttonHandler;