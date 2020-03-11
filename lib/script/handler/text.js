'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('../util');

var _styleCache = require('./styleCache');

var _config = require('../config');

function addTextMask(paragraph, _ref) {
  var textAlign = _ref.textAlign,
      lineHeight = _ref.lineHeight,
      paddingBottom = _ref.paddingBottom,
      paddingLeft = _ref.paddingLeft,
      paddingRight = _ref.paddingRight;
  var maskWidthPercent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

  var left = void 0;
  var right = void 0;
  switch (textAlign) {
    case 'center':
      left = document.createElement('span');
      right = document.createElement('span');[left, right].forEach(function (mask) {
        Object.assign(mask.style, {
          display: 'inline-block',
          width: maskWidthPercent / 2 * 100 + '%',
          height: lineHeight,
          background: '#fff',
          position: 'absolute',
          bottom: paddingBottom
        });
      });
      left.style.left = paddingLeft;
      right.style.right = paddingRight;
      paragraph.appendChild(left);
      paragraph.appendChild(right);
      break;
    case 'right':
      left = document.createElement('span');
      Object.assign(left.style, {
        display: 'inline-block',
        width: maskWidthPercent * 100 + '%',
        height: lineHeight,
        background: '#fff',
        position: 'absolute',
        bottom: paddingBottom,
        left: paddingLeft
      });
      paragraph.appendChild(left);
      break;
    case 'left':
    default:
      right = document.createElement('span');
      Object.assign(right.style, {
        display: 'inline-block',
        width: maskWidthPercent * 100 + '%',
        height: lineHeight,
        background: '#fff',
        position: 'absolute',
        bottom: paddingBottom,
        right: paddingRight
      });
      paragraph.appendChild(right);
      break;
  }
}

function textHandler(ele, _ref2, cssUnit, decimal) {
  var color = _ref2.color;

  var _ele$getBoundingClien = ele.getBoundingClientRect(),
      width = _ele$getBoundingClien.width;
  // if the text block's width is less than 50, just set it to transparent.


  if (width <= 50) {
    return (0, _util.setOpacity)(ele);
  }
  var comStyle = (0, _util.getComputedStyle)(ele);
  var text = ele.textContent;
  var lineHeight = comStyle.lineHeight,
      paddingTop = comStyle.paddingTop,
      paddingRight = comStyle.paddingRight,
      paddingBottom = comStyle.paddingBottom,
      paddingLeft = comStyle.paddingLeft,
      pos = comStyle.position,
      fontSize = comStyle.fontSize,
      textAlign = comStyle.textAlign,
      wordSpacing = comStyle.wordSpacing,
      wordBreak = comStyle.wordBreak;


  if (!/\d/.test(lineHeight)) {
    var fontSizeNum = parseFloat(fontSize, 10) || 14;
    lineHeight = fontSizeNum * 1.4 + 'px';
  }

  var position = ['fixed', 'absolute', 'flex'].find(function (p) {
    return p === pos;
  }) ? pos : 'relative';

  var height = ele.offsetHeight;
  // Math.floor
  var lineCount = (height - parseFloat(paddingTop, 10) - parseFloat(paddingBottom, 10)) / parseFloat(lineHeight, 10) | 0; // eslint-disable-line no-bitwise

  var textHeightRatio = parseFloat(fontSize, 10) / parseFloat(lineHeight, 10);
  if (Number.isNaN(textHeightRatio)) {
    textHeightRatio = 1 / 1.4; // default number
  }
  /* eslint-disable no-mixed-operators */
  var firstColorPoint = ((1 - textHeightRatio) / 2 * 100).toFixed(decimal);
  var secondColorPoint = (((1 - textHeightRatio) / 2 + textHeightRatio) * 100).toFixed(decimal);
  var backgroundSize = '100% ' + (0, _util.px2relativeUtil)(lineHeight, cssUnit, decimal);
  var className = _config.CLASS_NAME_PREFEX + 'text-' + firstColorPoint.toString(32).replace(/\./g, '-');

  var rule = '{\n    background-image: linear-gradient(transparent ' + firstColorPoint + '%, ' + color + ' 0%, ' + color + ' ' + secondColorPoint + '%, transparent 0%) !important;\n    background-size: ' + backgroundSize + ';\n    position: ' + position + ' !important;\n  }';

  var invariableClassName = _config.CLASS_NAME_PREFEX + 'text';

  var invariableRule = '{\n    background-origin: content-box !important;\n    background-clip: content-box !important;\n    background-color: transparent !important;\n    color: transparent !important;\n    background-repeat: repeat-y !important;\n  }';

  (0, _styleCache.addStyle)('.' + className, rule);
  (0, _styleCache.addStyle)('.' + invariableClassName, invariableRule);
  (0, _util.addClassName)(ele, [className, invariableClassName]);
  /* eslint-enable no-mixed-operators */
  // add white mask
  if (lineCount > 1) {
    addTextMask(ele, comStyle);
  } else {
    var textWidth = (0, _util.getTextWidth)(text, {
      fontSize: fontSize,
      lineHeight: lineHeight,
      wordBreak: wordBreak,
      wordSpacing: wordSpacing
    });
    var textWidthPercent = textWidth / (width - parseInt(paddingRight, 10) - parseInt(paddingLeft, 10));
    ele.style.backgroundSize = (textWidthPercent > 1 ? 1 : textWidthPercent) * 100 + '% ' + (0, _util.px2relativeUtil)(lineHeight, cssUnit, decimal);
    switch (textAlign) {
      case 'left':
        // do nothing
        break;
      case 'center':
        ele.style.backgroundPositionX = '50%';
        break;
      case 'right':
        ele.style.backgroundPositionX = '100%';
        break;
    }
  }
}

exports.default = textHandler;