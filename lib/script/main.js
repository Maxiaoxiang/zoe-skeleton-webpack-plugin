'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHtmlAndStyle = exports.genSkeleton = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _util = require('./util');

var _config = require('./config');

var _index = require('./handler/index.js');

var handler = _interopRequireWildcard(_index);

var _index2 = require('./animation/index.js');

var _styleCache = require('./handler/styleCache');

var _styleCache2 = _interopRequireDefault(_styleCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function traverse(options) {
  var remove = options.remove,
      excludes = options.excludes,
      text = options.text,
      image = options.image,
      button = options.button,
      svg = options.svg,
      grayBlock = options.grayBlock,
      pseudo = options.pseudo,
      cssUnit = options.cssUnit,
      decimal = options.decimal;

  var excludesEle = excludes.length ? Array.from((0, _util.$$)(excludes.join(','))) : [];
  var grayEle = grayBlock.length ? Array.from((0, _util.$$)(grayBlock.join(','))) : [];
  var rootElement = document.documentElement;

  var texts = [];
  var buttons = [];
  var hasImageBackEles = [];
  var toRemove = [];
  var imgs = [];
  var svgs = [];
  var pseudos = [];
  var gradientBackEles = [];
  var grayBlocks = [];

  if (Array.isArray(remove)) {
    remove.push.apply(remove, [_config.CONSOLE_SELECTOR].concat(_toConsumableArray(_config.PRE_REMOVE_TAGS)));
    toRemove.push.apply(toRemove, _toConsumableArray((0, _util.$$)(remove.join(','))));
  }

  if (button && button.excludes.length) {
    // translate selector to element
    button.excludes = Array.from((0, _util.$$)(button.excludes.join(',')));
  }

  ;[svg, pseudo, image].forEach(function (type) {
    if (type.shapeOpposite.length) {
      type.shapeOpposite = Array.from((0, _util.$$)(type.shapeOpposite.join(',')));
    }
  });(function preTraverse(ele) {
    var styles = (0, _util.getComputedStyle)(ele);
    var hasPseudoEle = (0, _util.checkHasPseudoEle)(ele);
    if (!(0, _util.inViewPort)(ele) || _config.DISPLAY_NONE.test(ele.getAttribute('style'))) {
      return toRemove.push(ele);
    }
    if (~grayEle.indexOf(ele)) {
      // eslint-disable-line no-bitwise
      return grayBlocks.push(ele);
    }
    if (~excludesEle.indexOf(ele)) return false; // eslint-disable-line no-bitwise

    if (hasPseudoEle) {
      pseudos.push(hasPseudoEle);
    }

    if ((0, _util.checkHasBorder)(styles)) {
      ele.style.border = 'none';
    }

    if (ele.children.length > 0 && /UL|OL/.test(ele.tagName)) {
      handler.list(ele);
    }
    if (ele.children && ele.children.length > 0) {
      Array.from(ele.children).forEach(function (child) {
        return preTraverse(child);
      });
    }

    // 将所有拥有 textChildNode 子元素的元素的文字颜色设置成背景色，这样就不会在显示文字了。
    if (ele.childNodes && Array.from(ele.childNodes).some(function (n) {
      return n.nodeType === _config.Node.TEXT_NODE;
    })) {
      (0, _util.transparent)(ele);
    }
    if ((0, _util.checkHasTextDecoration)(styles)) {
      ele.style.textDecorationColor = _config.TRANSPARENT;
    }
    // 隐藏所有 svg 元素
    if (ele.tagName === 'svg') {
      return svgs.push(ele);
    }
    if (_config.EXT_REG.test(styles.background) || _config.EXT_REG.test(styles.backgroundImage)) {
      return hasImageBackEles.push(ele);
    }
    if (_config.GRADIENT_REG.test(styles.background) || _config.GRADIENT_REG.test(styles.backgroundImage)) {
      return gradientBackEles.push(ele);
    }
    if (ele.tagName === 'IMG' || (0, _util.isBase64Img)(ele)) {
      return imgs.push(ele);
    }
    if (ele.nodeType === _config.Node.ELEMENT_NODE && (ele.tagName === 'BUTTON' || ele.tagName === 'A' && ele.getAttribute('role') === 'button')) {
      return buttons.push(ele);
    }
    if (ele.childNodes && ele.childNodes.length === 1 && ele.childNodes[0].nodeType === _config.Node.TEXT_NODE && /\S/.test(ele.childNodes[0].textContent)) {
      return texts.push(ele);
    }
  })(rootElement);

  svgs.forEach(function (e) {
    return handler.svg(e, svg, cssUnit, decimal);
  });
  texts.forEach(function (e) {
    return handler.text(e, text, cssUnit, decimal);
  });
  buttons.forEach(function (e) {
    return handler.button(e, button);
  });
  hasImageBackEles.forEach(function (e) {
    return handler.background(e, image);
  });
  imgs.forEach(function (e) {
    return handler.image(e, image);
  });
  pseudos.forEach(function (e) {
    return handler.pseudos(e, pseudo);
  });
  gradientBackEles.forEach(function (e) {
    return handler.background(e, image);
  });
  grayBlocks.forEach(function (e) {
    return handler.grayBlock(e, button);
  });
  // remove mock text wrapper
  var offScreenParagraph = (0, _util.$)('#' + _config.MOCK_TEXT_ID);
  if (offScreenParagraph && offScreenParagraph.parentNode) {
    toRemove.push(offScreenParagraph.parentNode);
  }
  toRemove.forEach(function (e) {
    return (0, _util.removeElement)(e);
  });
}

function genSkeleton(options) {
  var remove = options.remove,
      hide = options.hide,
      _options$loading = options.loading,
      loading = _options$loading === undefined ? 'spin' : _options$loading;
  /**
   * before walk
   */
  // 将 `hide` 队列中的元素通过调节透明度为 0 来进行隐藏

  if (hide.length) {
    var hideEle = (0, _util.$$)(hide.join(','));
    Array.from(hideEle).forEach(function (ele) {
      return (0, _util.setOpacity)(ele);
    });
  }
  /**
   * walk in process
   */

  traverse(options);
  /**
   * add `<style>`
   */
  var rules = '';

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = _styleCache2.default[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2),
          selector = _step$value[0],
          rule = _step$value[1];

      rules += selector + ' ' + rule + '\n';
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

  var styleEle = document.createElement('style');

  if (!window.createPopup) {
    // For Safari
    styleEle.appendChild(document.createTextNode(''));
  }
  styleEle.innerHTML = rules;
  if (document.head) {
    document.head.appendChild(styleEle);
  } else {
    document.body.appendChild(styleEle);
  }
  /**
   * add animation of skeleton page when loading
   */
  switch (loading) {
    case 'chiaroscuro':
      (0, _index2.addBlick)();
      break;
    case 'spin':
      (0, _index2.addSpin)();
      break;
    case 'shine':
      (0, _index2.addShine)();
      break;
    default:
      (0, _index2.addSpin)();
      break;
  }
}

function getHtmlAndStyle() {
  var root = document.documentElement;
  var rawHtml = root.outerHTML;
  var styles = Array.from((0, _util.$$)('style')).map(function (style) {
    return style.innerHTML || style.innerText;
  });
  Array.from((0, _util.$$)(_config.AFTER_REMOVE_TAGS.join(','))).forEach(function (ele) {
    return (0, _util.removeElement)(ele);
  });
  // fix html parser can not handle `<div ubt-click=3659 ubt-data="{&quot;restaurant_id&quot;:1236835}" >`
  // need replace `&quot;` into `'`
  var cleanedHtml = document.body.innerHTML.replace(/&quot;/g, "'");
  return {
    rawHtml: rawHtml,
    styles: styles,
    cleanedHtml: cleanedHtml
  };
}

exports.genSkeleton = genSkeleton;
exports.getHtmlAndStyle = getHtmlAndStyle;