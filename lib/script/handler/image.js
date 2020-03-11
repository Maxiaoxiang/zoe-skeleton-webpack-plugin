'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _config = require('../config');

var _util = require('../util');

var _styleCache = require('./styleCache');

function imgHandler(ele, _ref) {
  var color = _ref.color,
      shape = _ref.shape,
      shapeOpposite = _ref.shapeOpposite;

  var _ele$getBoundingClien = ele.getBoundingClientRect(),
      width = _ele$getBoundingClien.width,
      height = _ele$getBoundingClien.height;

  var attrs = {
    width: width,
    height: height,
    src: _config.SMALLEST_BASE64
  };

  var finalShape = shapeOpposite.indexOf(ele) > -1 ? (0, _util.getOppositeShape)(shape) : shape;

  (0, _util.setAttributes)(ele, attrs);

  var className = _config.CLASS_NAME_PREFEX + 'image';
  var shapeName = _config.CLASS_NAME_PREFEX + finalShape;
  var rule = '{\n    background: ' + color + ' !important;\n  }';
  (0, _styleCache.addStyle)('.' + className, rule);
  (0, _styleCache.shapeStyle)(finalShape);

  (0, _util.addClassName)(ele, [className, shapeName]);

  if (ele.hasAttribute('alt')) {
    ele.removeAttribute('alt');
  }
}

exports.default = imgHandler;