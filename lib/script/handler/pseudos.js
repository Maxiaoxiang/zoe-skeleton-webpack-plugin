'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('../util');

var _config = require('../config');

var _styleCache = require('./styleCache');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function pseudosHandler(_ref, _ref2) {
  var _rules;

  var ele = _ref.ele,
      hasBefore = _ref.hasBefore,
      hasAfter = _ref.hasAfter;
  var color = _ref2.color,
      shape = _ref2.shape,
      shapeOpposite = _ref2.shapeOpposite;

  var finalShape = shapeOpposite.indexOf(ele) > -1 ? (0, _util.getOppositeShape)(shape) : shape;
  var PSEUDO_CLASS = _config.CLASS_NAME_PREFEX + 'pseudo';
  var PSEUDO_RECT_CLASS = _config.CLASS_NAME_PREFEX + 'pseudo-rect';
  var PSEUDO_CIRCLE_CLASS = _config.CLASS_NAME_PREFEX + 'pseudo-circle';

  var rules = (_rules = {}, _defineProperty(_rules, '.' + PSEUDO_CLASS + '::before, .' + PSEUDO_CLASS + '::after', '{\n      background: ' + color + ' !important;\n      background-image: none !important;\n      color: transparent !important;\n      border-color: transparent !important;\n    }'), _defineProperty(_rules, '.' + PSEUDO_RECT_CLASS + '::before, .' + PSEUDO_RECT_CLASS + '::after', '{\n      border-radius: 0 !important;\n    }'), _defineProperty(_rules, '.' + PSEUDO_CIRCLE_CLASS + '::before, .' + PSEUDO_CIRCLE_CLASS + '::after', '{\n      border-radius: 50% !important;\n    }'), _rules);

  Object.keys(rules).forEach(function (key) {
    (0, _styleCache.addStyle)(key, rules[key]);
  });

  (0, _util.addClassName)(ele, [PSEUDO_CLASS, finalShape === 'circle' ? PSEUDO_CIRCLE_CLASS : PSEUDO_RECT_CLASS]);
}

exports.default = pseudosHandler;