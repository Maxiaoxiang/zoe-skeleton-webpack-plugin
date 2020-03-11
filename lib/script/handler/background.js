'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _styleCache = require('./styleCache');

var _config = require('../config');

var _util = require('../util');

function backgroundHandler(ele, _ref) {
  var color = _ref.color,
      shape = _ref.shape;

  var imageClass = _config.CLASS_NAME_PREFEX + 'image';
  var shapeClass = _config.CLASS_NAME_PREFEX + shape;
  var rule = '{\n    background: ' + color + ' !important;\n  }';

  (0, _styleCache.addStyle)('.' + imageClass, rule);

  (0, _styleCache.shapeStyle)(shape);

  (0, _util.addClassName)(ele, [imageClass, shapeClass]);
} /**
   * use the same config options as image block.
   */
exports.default = backgroundHandler;