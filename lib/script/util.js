'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.emptyElement = exports.removeElement = exports.transparent = exports.setOpacity = exports.addClassName = exports.getTextWidth = exports.px2relativeUtil = exports.getViewPort = exports.checkHasTextDecoration = exports.getOppositeShape = exports.checkHasBorder = exports.checkHasPseudoEle = exports.inViewPort = exports.setAttributes = exports.isBase64Img = exports.$ = exports.$$ = exports.getComputedStyle = undefined;

var _config = require('./config');

var _styleCache = require('./handler/styleCache');

var getComputedStyle = exports.getComputedStyle = window.getComputedStyle;
var $$ = exports.$$ = document.querySelectorAll.bind(document);
var $ = exports.$ = document.querySelector.bind(document);
var isBase64Img = exports.isBase64Img = function isBase64Img(img) {
  return (/base64/.test(img.src)
  );
};

var setAttributes = exports.setAttributes = function setAttributes(ele, attrs) {
  Object.keys(attrs).forEach(function (k) {
    return ele.setAttribute(k, attrs[k]);
  });
};

var inViewPort = exports.inViewPort = function inViewPort(ele) {
  var rect = ele.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.left < window.innerWidth;
};

var checkHasPseudoEle = exports.checkHasPseudoEle = function checkHasPseudoEle(ele) {
  var hasBefore = getComputedStyle(ele, '::before').getPropertyValue('content') !== '';
  var hasAfter = getComputedStyle(ele, '::after').getPropertyValue('content') !== '';
  if (hasBefore || hasAfter) {
    return { hasBefore: hasBefore, hasAfter: hasAfter, ele: ele };
  }
  return false;
};

var checkHasBorder = exports.checkHasBorder = function checkHasBorder(styles) {
  return styles.getPropertyValue('border-style') !== 'none';
};

var getOppositeShape = exports.getOppositeShape = function getOppositeShape(shape) {
  return shape === 'circle' ? 'rect' : 'circle';
};

var checkHasTextDecoration = exports.checkHasTextDecoration = function checkHasTextDecoration(styles) {
  return !/none/.test(styles.textDecorationLine);
};

var getViewPort = exports.getViewPort = function getViewPort() {
  var vh = window.innerHeight;
  var vw = window.innerWidth;

  return {
    vh: vh,
    vw: vw,
    vmax: Math.max(vw, vh),
    vmin: Math.min(vw, vh)
  };
};

var px2relativeUtil = exports.px2relativeUtil = function px2relativeUtil(px) {
  var unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'rem';
  var decimal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;

  var pxValue = typeof px === 'string' ? parseFloat(px, 10) : px;
  if (unit === 'rem') {
    var htmlElementFontSize = getComputedStyle(document.documentElement).fontSize;
    return '' + (pxValue / parseFloat(htmlElementFontSize, 10)).toFixed(decimal) + unit;
  } else {
    var dimensions = getViewPort();
    var base = dimensions[unit];
    return '' + (pxValue / base * 100).toFixed(decimal) + unit;
  }
};

var getTextWidth = exports.getTextWidth = function getTextWidth(text, style) {
  var offScreenParagraph = document.querySelector('#' + _config.MOCK_TEXT_ID);
  if (!offScreenParagraph) {
    var wrapper = document.createElement('p');
    offScreenParagraph = document.createElement('span');
    Object.assign(wrapper.style, {
      width: '10000px'
    });
    offScreenParagraph.id = _config.MOCK_TEXT_ID;
    wrapper.appendChild(offScreenParagraph);
    document.body.appendChild(wrapper);
  }
  Object.assign(offScreenParagraph.style, style);
  offScreenParagraph.textContent = text;
  return offScreenParagraph.getBoundingClientRect().width;
};

var addClassName = exports.addClassName = function addClassName(ele, classArray) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = classArray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var name = _step.value;

      ele.classList.add(name);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

var setOpacity = exports.setOpacity = function setOpacity(ele) {
  var className = _config.CLASS_NAME_PREFEX + 'opacity';
  var rule = '{\n    opacity: 0 !important;\n  }';
  (0, _styleCache.addStyle)('.' + className, rule);
  ele.classList.add(className);
};

var transparent = exports.transparent = function transparent(ele) {
  var className = _config.CLASS_NAME_PREFEX + 'transparent';
  var rule = '{\n    color: ' + _config.TRANSPARENT + ' !important;\n  }';
  (0, _styleCache.addStyle)('.' + className, rule);
  ele.classList.add(className);
};

var removeElement = exports.removeElement = function removeElement(ele) {
  var parent = ele.parentNode;
  if (parent) {
    parent.removeChild(ele);
  }
};

var emptyElement = exports.emptyElement = function emptyElement(ele) {
  ele.innerHTML = '';
};