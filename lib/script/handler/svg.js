'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('../util');

var _config = require('../config');

var _styleCache = require('./styleCache');

function svgHandler(ele, _ref, cssUnit, decimal) {
  var color = _ref.color,
      shape = _ref.shape,
      shapeOpposite = _ref.shapeOpposite;

  var _ele$getBoundingClien = ele.getBoundingClientRect(),
      width = _ele$getBoundingClien.width,
      height = _ele$getBoundingClien.height;

  if (width === 0 || height === 0 || ele.getAttribute('aria-hidden') === 'true') {
    return (0, _util.removeElement)(ele);
  }

  var finalShape = shapeOpposite.indexOf(ele) > -1 ? (0, _util.getOppositeShape)(shape) : shape;

  (0, _util.emptyElement)(ele);

  var shapeClassName = _config.CLASS_NAME_PREFEX + shape;
  (0, _styleCache.shapeStyle)(shape);

  Object.assign(ele.style, {
    width: (0, _util.px2relativeUtil)(width, cssUnit, decimal),
    height: (0, _util.px2relativeUtil)(height, cssUnit, decimal)
  });

  (0, _util.addClassName)(ele, [shapeClassName]);

  if (color === _config.TRANSPARENT) {
    (0, _util.setOpacity)(ele);
  } else {
    var className = _config.CLASS_NAME_PREFEX + 'svg';
    var rule = '{\n      background: ' + color + ' !important;\n    }';
    (0, _styleCache.addStyle)('.' + className, rule);
    ele.classList.add(className);
  }
}

exports.default = svgHandler;