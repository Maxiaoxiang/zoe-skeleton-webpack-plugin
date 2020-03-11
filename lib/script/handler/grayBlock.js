'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _styleCache = require('./styleCache');

var _config = require('../config');

function grayHandler(ele, _ref) {
  var color = _ref.color;

  var classname = _config.CLASS_NAME_PREFEX + 'gray';
  var rule = '{\n    color: ' + color + ' !important;\n    background: ' + color + ' !important;\n  }';
  (0, _styleCache.addStyle)('.' + classname, rule);
  ele.classList.add(classname);

  var elements = ele.querySelectorAll('*');
  Array.from(elements).forEach(function (element) {
    var childNodes = element.childNodes;
    if (Array.from(childNodes).some(function (n) {
      return n.nodeType === _config.Node.TEXT_NODE;
    })) {
      element.classList.add(classname);
    }
  });
}

exports.default = grayHandler;