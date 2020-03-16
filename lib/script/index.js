'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Skeleton = function (exports) {
  'use strict';

  /**
   * constants
   */

  var TRANSPARENT = 'transparent';
  var EXT_REG = /\.(jpeg|jpg|png|gif|svg|webp)/;
  var GRADIENT_REG = /gradient/;
  var DISPLAY_NONE = /display:\s*none/;
  var PRE_REMOVE_TAGS = ['script'];
  var AFTER_REMOVE_TAGS = ['title', 'meta', 'style'];
  var CLASS_NAME_PREFEX = 'sk-';
  var CONSOLE_SELECTOR = '.sk-console';
  var IMAGE_FIXED = 'data-pswp-fixedsize';
  // 最小 1 * 1 像素的透明 gif 图片
  var SMALLEST_BASE64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  var MOCK_TEXT_ID = 'sk-text-id';
  var Node = window.Node;

  /**
   * a Map instance to cache the styles which will be inserted into the skeleton page.
   * key is the selector and value is the css rules.
   */

  var styleCache = new Map();

  // some common styles
  var shapeStyle = function shapeStyle(shape) {
    var selector = '.' + (CLASS_NAME_PREFEX + shape);
    var rule = '{\n    border-radius: ' + (shape === 'rect' ? '0' : '50%') + ';\n  }';
    if (!styleCache.has(selector)) {
      styleCache.set(selector, rule);
    }
  };

  var addStyle = function addStyle(selector, rule, replaced) {
    if (!styleCache.has(selector) || replaced) {
      styleCache.set(selector, rule);
    }
  };

  var getComputedStyle = window.getComputedStyle;
  var $$ = document.querySelectorAll.bind(document);
  var $ = document.querySelector.bind(document);
  var isBase64Img = function isBase64Img(img) {
    return (/base64/.test(img.src)
    );
  };

  var setAttributes = function setAttributes(ele, attrs) {
    Object.keys(attrs).forEach(function (k) {
      return ele.setAttribute(k, attrs[k]);
    });
  };

  var inViewPort = function inViewPort(ele) {
    var rect = ele.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.left < window.innerWidth;
  };

  var checkHasPseudoEle = function checkHasPseudoEle(ele) {
    var hasBefore = getComputedStyle(ele, '::before').getPropertyValue('content') !== '';
    var hasAfter = getComputedStyle(ele, '::after').getPropertyValue('content') !== '';
    if (hasBefore || hasAfter) {
      return { hasBefore: hasBefore, hasAfter: hasAfter, ele: ele };
    }
    return false;
  };

  var checkHasBorder = function checkHasBorder(styles) {
    return styles.getPropertyValue('border-style') !== 'none';
  };

  var getOppositeShape = function getOppositeShape(shape) {
    return shape === 'circle' ? 'rect' : 'circle';
  };

  var checkHasTextDecoration = function checkHasTextDecoration(styles) {
    return !/none/.test(styles.textDecorationLine);
  };

  var getViewPort = function getViewPort() {
    var vh = window.innerHeight;
    var vw = window.innerWidth;

    return {
      vh: vh,
      vw: vw,
      vmax: Math.max(vw, vh),
      vmin: Math.min(vw, vh)
    };
  };

  var px2relativeUtil = function px2relativeUtil(px) {
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

  var getTextWidth = function getTextWidth(text, style) {
    var offScreenParagraph = document.querySelector('#' + MOCK_TEXT_ID);
    if (!offScreenParagraph) {
      var wrapper = document.createElement('p');
      offScreenParagraph = document.createElement('span');
      Object.assign(wrapper.style, {
        width: '10000px'
      });
      offScreenParagraph.id = MOCK_TEXT_ID;
      wrapper.appendChild(offScreenParagraph);
      document.body.appendChild(wrapper);
    }
    Object.assign(offScreenParagraph.style, style);
    offScreenParagraph.textContent = text;
    return offScreenParagraph.getBoundingClientRect().width;
  };

  var addClassName = function addClassName(ele, classArray) {
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

  var setOpacity = function setOpacity(ele) {
    var className = CLASS_NAME_PREFEX + 'opacity';
    var rule = '{\n    opacity: 0 !important;\n  }';
    addStyle('.' + className, rule);
    ele.classList.add(className);
  };

  var transparent = function transparent(ele) {
    var className = CLASS_NAME_PREFEX + 'transparent';
    var rule = '{\n    color: ' + TRANSPARENT + ' !important;\n  }';
    addStyle('.' + className, rule);
    ele.classList.add(className);
  };

  var removeElement = function removeElement(ele) {
    var parent = ele.parentNode;
    if (parent) {
      parent.removeChild(ele);
    }
  };

  var emptyElement = function emptyElement(ele) {
    ele.innerHTML = '';
  };

  function listHandle(ele) {
    var children = ele.children;
    var len = Array.from(children).filter(function (child) {
      return child.tagName === 'LI';
    }).length;
    if (len === 0) return false;
    var firstChild = children[0];
    // 解决有时ul元素子元素不是 li元素的 bug。
    if (firstChild.tagName !== 'LI') return listHandle(firstChild);
    Array.from(children).forEach(function (c, i) {
      if (i > 0) c.parentNode.removeChild(c);
    });
    // 将 li 所有兄弟元素设置成相同的元素，保证生成的页面骨架整齐
    for (var i = 1; i < len; i++) {
      ele.appendChild(firstChild.cloneNode(true));
    }
  }

  /**
   * use the same config options as image block.
   */

  function backgroundHandler(ele, _ref) {
    var color = _ref.color,
        shape = _ref.shape;

    var imageClass = CLASS_NAME_PREFEX + 'image';
    var shapeClass = CLASS_NAME_PREFEX + shape;
    var rule = '{\n    background: ' + color + ' !important;\n  }';

    addStyle('.' + imageClass, rule);

    shapeStyle(shape);

    addClassName(ele, [imageClass, shapeClass]);
  }

  /**
   * [buttonHandler 改变 button 元素样式：包括去除 border和 box-shadow, 背景色和文字颜色统一]
   */

  function buttonHandler(ele, _ref2) {
    var color = _ref2.color,
        excludes = _ref2.excludes;

    if (excludes.indexOf(ele) > -1) return false;
    var classname = CLASS_NAME_PREFEX + 'button';
    var rule = '{\n      color: ' + color + ' !important;\n      background: ' + color + ' !important;\n      border: none !important;\n      box-shadow: none !important;\n    }';
    addStyle('.' + classname, rule);
    ele.classList.add(classname);
  }

  function grayHandler(ele, _ref3) {
    var color = _ref3.color;

    var classname = CLASS_NAME_PREFEX + 'gray';
    var rule = '{\n    color: ' + color + ' !important;\n    background: ' + color + ' !important;\n  }';
    addStyle('.' + classname, rule);
    ele.classList.add(classname);

    var elements = ele.querySelectorAll('*');
    Array.from(elements).forEach(function (element) {
      var childNodes = element.childNodes;
      if (Array.from(childNodes).some(function (n) {
        return n.nodeType === Node.TEXT_NODE;
      })) {
        element.classList.add(classname);
      }
    });
  }

  function imgHandler(ele, _ref4) {
    var color = _ref4.color,
        shape = _ref4.shape,
        shapeOpposite = _ref4.shapeOpposite,
        fixedSize = _ref4.fixedSize;

    var _ele$getBoundingClien = ele.getBoundingClientRect(),
        width = _ele$getBoundingClien.width,
        height = _ele$getBoundingClien.height;

    var isFixed = ele.hasAttribute(IMAGE_FIXED) || fixedSize;
    var attrs = {
      width: width,
      height: height,
      src: SMALLEST_BASE64 // 1*1像素透明gif图
    };

    var finalShape = shapeOpposite.indexOf(ele) > -1 ? getOppositeShape(shape) : shape;

    setAttributes(ele, attrs);
    if (isFixed) {
      ele.style.width = width + 'px';
      ele.style.height = height + 'px';
    }

    var className = CLASS_NAME_PREFEX + 'image';
    var shapeName = CLASS_NAME_PREFEX + finalShape;
    var rule = '{\n    background: ' + color + ' !important;\n  }';

    addStyle('.' + className, rule, true);
    shapeStyle(finalShape);

    addClassName(ele, [className, shapeName]);

    if (ele.hasAttribute('alt')) {
      ele.removeAttribute('alt');
    }
  }

  function pseudosHandler(_ref5, _ref6) {
    var _rules;

    var ele = _ref5.ele,
        hasBefore = _ref5.hasBefore,
        hasAfter = _ref5.hasAfter;
    var color = _ref6.color,
        shape = _ref6.shape,
        shapeOpposite = _ref6.shapeOpposite;

    if (!shapeOpposite) shapeOpposite = [];
    var finalShape = shapeOpposite.indexOf(ele) > -1 ? getOppositeShape(shape) : shape;
    var PSEUDO_CLASS = CLASS_NAME_PREFEX + 'pseudo';
    var PSEUDO_RECT_CLASS = CLASS_NAME_PREFEX + 'pseudo-rect';
    var PSEUDO_CIRCLE_CLASS = CLASS_NAME_PREFEX + 'pseudo-circle';

    var rules = (_rules = {}, _defineProperty(_rules, '.' + PSEUDO_CLASS + '::before, .' + PSEUDO_CLASS + '::after', '{\n      background: ' + color + ' !important;\n      background-image: none !important;\n      color: transparent !important;\n      border-color: transparent !important;\n    }'), _defineProperty(_rules, '.' + PSEUDO_RECT_CLASS + '::before, .' + PSEUDO_RECT_CLASS + '::after', '{\n      border-radius: 0 !important;\n    }'), _defineProperty(_rules, '.' + PSEUDO_CIRCLE_CLASS + '::before, .' + PSEUDO_CIRCLE_CLASS + '::after', '{\n      border-radius: 50% !important;\n    }'), _rules);

    Object.keys(rules).forEach(function (key) {
      addStyle(key, rules[key]);
    });

    addClassName(ele, [PSEUDO_CLASS, finalShape === 'circle' ? PSEUDO_CIRCLE_CLASS : PSEUDO_RECT_CLASS]);
  }

  function svgHandler(ele, _ref7, cssUnit, decimal) {
    var color = _ref7.color,
        shape = _ref7.shape,
        shapeOpposite = _ref7.shapeOpposite;

    var _ele$getBoundingClien2 = ele.getBoundingClientRect(),
        width = _ele$getBoundingClien2.width,
        height = _ele$getBoundingClien2.height;

    // 宽高为0或设置隐藏的元素直接移除（aria是适配残障人士阅读的属性前缀）


    if (width === 0 || height === 0 || ele.getAttribute('aria-hidden') === 'true') {
      return removeElement(ele);
    }

    // 设置shapeOpposite的元素的最终形状和shape配置的相反
    var finalShape = shapeOpposite.indexOf(ele) > -1 ? getOppositeShape(shape) : shape;

    // 清空元素的内部结构
    emptyElement(ele);

    var shapeClassName = CLASS_NAME_PREFEX + shape;
    // 根据rect or cirle设置border-radius属性，同时set到styleCache
    shapeStyle(shape);

    Object.assign(ele.style, {
      width: px2relativeUtil(width, cssUnit, decimal),
      height: px2relativeUtil(height, cssUnit, decimal)
    });

    addClassName(ele, [shapeClassName]);

    // color是自定义svg配置中的color属性,可设置16进制设置及transparent枚举值
    if (color === TRANSPARENT) {
      // 设置为透明块
      setOpacity(ele);
    } else {
      // 设置背景色
      var className = CLASS_NAME_PREFEX + 'svg';
      var rule = '{\n      background: ' + color + ' !important;\n    }';
      addStyle('.' + className, rule);
      ele.classList.add(className);
    }
  }

  function addTextMask(paragraph, _ref8) {
    var textAlign = _ref8.textAlign,
        lineHeight = _ref8.lineHeight,
        paddingBottom = _ref8.paddingBottom,
        paddingLeft = _ref8.paddingLeft,
        paddingRight = _ref8.paddingRight;
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

  function textHandler(ele, _ref9, cssUnit, decimal) {
    var color = _ref9.color;

    var _ele$getBoundingClien3 = ele.getBoundingClientRect(),
        width = _ele$getBoundingClien3.width;
    // if the text block's width is less than 30, just set it to transparent.


    if (width <= 25) {
      return setOpacity(ele);
    }
    var comStyle = getComputedStyle(ele);
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
    // 文本行数 =（ 高度 - 上下padding ） / 行高
    var lineCount = (height - parseFloat(paddingTop, 10) - parseFloat(paddingBottom, 10)) / parseFloat(lineHeight, 10) | 0; // eslint-disable-line no-bitwise

    // 文本高度比 = 字体高度/行高
    var textHeightRatio = parseFloat(fontSize, 10) / parseFloat(lineHeight, 10);
    if (Number.isNaN(textHeightRatio)) {
      textHeightRatio = 1 / 1.4; // default number
    }
    /* eslint-disable no-mixed-operators */
    var firstColorPoint = ((1 - textHeightRatio) / 2 * 100).toFixed(decimal);
    var secondColorPoint = (((1 - textHeightRatio) / 2 + textHeightRatio) * 100).toFixed(decimal);
    var backgroundSize = '100% ' + px2relativeUtil(lineHeight, cssUnit, decimal);
    var className = CLASS_NAME_PREFEX + 'text-' + firstColorPoint.toString(32).replace(/\./g, '-');

    var rule = '{\n    background-image: linear-gradient(transparent ' + firstColorPoint + '%, ' + color + ' 0%, ' + color + ' ' + secondColorPoint + '%, transparent 0%) !important;\n    background-size: ' + backgroundSize + ';\n    position: ' + position + ' !important;\n  }';

    var invariableClassName = CLASS_NAME_PREFEX + 'text';

    var invariableRule = '{\n    background-origin: content-box !important;\n    background-clip: content-box !important;\n    background-color: transparent !important;\n    color: transparent !important;\n    background-repeat: repeat-y !important;\n  }';

    addStyle('.' + className, rule);
    addStyle('.' + invariableClassName, invariableRule);
    addClassName(ele, [className, invariableClassName]);
    /* eslint-enable no-mixed-operators */
    // add white mask
    if (lineCount > 1) {
      addTextMask(ele, comStyle);
    } else {
      var textWidth = getTextWidth(text, {
        fontSize: fontSize,
        lineHeight: lineHeight,
        wordBreak: wordBreak,
        wordSpacing: wordSpacing
      });
      var textWidthPercent = textWidth / (width - parseInt(paddingRight, 10) - parseInt(paddingLeft, 10));
      ele.style.backgroundSize = (textWidthPercent > 1 ? 1 : textWidthPercent) * 100 + '% ' + px2relativeUtil(lineHeight, cssUnit, decimal);
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

  var addBlick = function addBlick() {
    var style = document.createElement('style');
    var styleContent = '\n      @keyframes blink {\n        0% {\n          opacity: .4;\n        }\n\n        50% {\n          opacity: 1;\n        }\n\n        100% {\n          opacity: .4;\n        }\n      }\n      .blink {\n        animation-duration: 2s;\n        animation-name: blink;\n        animation-iteration-count: infinite;\n      }\n    ';
    style.innerHTML = styleContent;
    document.head.appendChild(style);
    document.body.firstElementChild.classList.add('blink');
  };

  var addShine = function addShine() {
    var style = document.createElement('style');
    var styleContent = '\n      body {\n        overflow: hidden;\n      }\n      @keyframes flush {\n        0% {\n          left: -100%;\n        }\n        50% {\n          left: 0;\n        }\n        100% {\n          left: 100%;\n        }\n      }\n      .sk-loading {\n        animation: flush 2s linear infinite;\n        position: absolute;\n        top: 0;\n        bottom: 0;\n        width: 100%;\n        background: linear-gradient(to left, \n          rgba(255, 255, 255, 0) 0%,\n          rgba(255, 255, 255, .85) 50%,\n          rgba(255, 255, 255, 0) 100%\n        )\n      }\n    ';
    style.innerHTML = styleContent;
    var load = document.createElement('div');
    load.classList.add('sk-loading');
    document.head.appendChild(style);
    document.body.appendChild(load);
  };

  var addSpin = function addSpin() {
    var style = document.createElement('style');
    var styleContent = '\n      @keyframes loading-rotate {\n        100% {\n          transform: rotate(360deg);\n        }\n      }\n\n      @keyframes loading-dash {\n        0% {\n          stroke-dasharray: 1, 200;\n          stroke-dashoffset: 0;\n        }\n        50% {\n          stroke-dasharray: 90, 150;\n          stroke-dashoffset: -40px;\n        }\n        100% {\n          stroke-dasharray: 90, 150;\n          stroke-dashoffset: -120px;\n        }\n      }\n\n      .sk-loading-spinner {\n        top: 50%;\n        margin-top: -0.5rem;\n        width: 100%;\n        text-align: center;\n        position: absolute;\n      }\n\n      .sk-loading-spinner .circular {\n        height: 1rem;\n        width: 1rem;\n        animation: loading-rotate 2s linear infinite;\n      }\n\n      .sk-loading-spinner .path {\n        animation: loading-dash 1.5s ease-in-out infinite;\n        stroke-dasharray: 90,150;\n        stroke-dashoffset: 0;\n        stroke-width: 2;\n        stroke: #409eff;\n        stroke-linecap: round;\n      }\n    ';
    style.innerHTML = styleContent;
    document.head.appendChild(style);
    var spinContainer = document.createElement('div');
    spinContainer.classList.add('sk-loading-spinner');
    spinContainer.innerHTML = '<svg viewBox="25 25 50 50" class="circular"><circle cx="50" cy="50" r="20" fill="none" class="path"></circle></svg>';
    document.body.appendChild(spinContainer);
  };

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

    var excludesEle = excludes && excludes.length ? Array.from($$(excludes.join(','))) : [];
    var grayEle = grayBlock && grayBlock.length ? Array.from($$(grayBlock.join(','))) : [];
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
      remove.push.apply(remove, [CONSOLE_SELECTOR].concat(PRE_REMOVE_TAGS));
      toRemove.push.apply(toRemove, _toConsumableArray($$(remove.join(','))));
    }

    if (button && button.excludes.length) {
      // translate selector to element
      button.excludes = Array.from($$(button.excludes.join(',')));
    }
    [svg, pseudo, image].forEach(function (type) {
      if (type && type.shapeOpposite && type.shapeOpposite.length) {
        type.shapeOpposite = Array.from($$(type.shapeOpposite.join(',')));
      }
    })

    // ele 为 document.documentElement; 递归遍历DOM树
    ;(function preTraverse(ele) {
      // styles为元素中所有可用的css属性列表
      var styles = getComputedStyle(ele);
      // 检查元素是否有伪元素
      var hasPseudoEle = checkHasPseudoEle(ele);

      // 判断元素是否在可视区域内（是否是首屏元素），非首屏元素将要移除
      if (!inViewPort(ele) || DISPLAY_NONE.test(ele.getAttribute('style'))) {
        return toRemove.push(ele);
      }

      // 自定义要处理为色块的元素
      if (~grayEle.indexOf(ele)) {
        // eslint-disable-line no-bitwise
        return grayBlocks.push(ele);
      }

      // 自定义不需要处理为骨架的元素
      if (~excludesEle.indexOf(ele)) return false; // eslint-disable-line no-bitwise

      if (hasPseudoEle) {
        pseudos.push(hasPseudoEle);
      }

      if (checkHasBorder(styles)) {
        ele.style.border = 'none';
      }

      // 列表元素统一处理为默认样式
      if (ele.children.length > 0 && /UL|OL/.test(ele.tagName)) {
        listHandle(ele);
      }

      // 有子节点遍历处理
      if (ele.children && ele.children.length > 0) {
        Array.from(ele.children).forEach(function (child) {
          return preTraverse(child);
        });
      }

      // 将所有拥有 textChildNode 子元素的元素的文字颜色设置成背景色，这样就不会在显示文字了。
      if (ele.childNodes && Array.from(ele.childNodes).some(function (n) {
        return n.nodeType === Node.TEXT_NODE;
      })) {
        transparent(ele);
      }

      // 统一文本下划线的颜色
      if (checkHasTextDecoration(styles)) {
        ele.style.textDecorationColor = TRANSPARENT;
      }
      //隐藏所有 input 元素，防止 placeholder 未隐藏
      if (ele.tagName === 'INPUT') {
        return toRemove.push(ele);
      }
      // 隐藏所有 svg 元素
      if (ele.tagName === 'svg') {
        return svgs.push(ele);
      }

      // 有背景色或背景图的元素
      if (EXT_REG.test(styles.background) || EXT_REG.test(styles.backgroundImage)) {
        return hasImageBackEles.push(ele);
      }
      // 背景渐变元素
      if (GRADIENT_REG.test(styles.background) || GRADIENT_REG.test(styles.backgroundImage)) {
        return gradientBackEles.push(ele);
      }
      if (ele.tagName === 'IMG' || isBase64Img(ele)) {
        return imgs.push(ele);
      }
      if (ele.nodeType === Node.ELEMENT_NODE && (ele.tagName === 'BUTTON' || ele.tagName === 'A' && ele.getAttribute('role') === 'button')) {
        return buttons.push(ele);
      }
      if (ele.childNodes && ele.childNodes.length === 1 && ele.childNodes[0].nodeType === Node.TEXT_NODE && /\S/.test(ele.childNodes[0].textContent)) {
        return texts.push(ele);
      }
    })(rootElement);

    svgs.forEach(function (e) {
      return svgHandler(e, svg, cssUnit, decimal);
    });
    texts.forEach(function (e) {
      textHandler(e, text, cssUnit, decimal);
    });
    buttons.forEach(function (e) {
      return buttonHandler(e, button);
    });
    hasImageBackEles.forEach(function (e) {
      return backgroundHandler(e, image);
    });
    imgs.forEach(function (e) {
      return imgHandler(e, image);
    });
    pseudos.forEach(function (e) {
      return pseudosHandler(e, pseudo);
    });
    gradientBackEles.forEach(function (e) {
      return backgroundHandler(e, image);
    });
    grayBlocks.forEach(function (e) {
      return grayHandler(e, button);
    });
    // remove mock text wrapper
    var offScreenParagraph = $('#' + MOCK_TEXT_ID);
    if (offScreenParagraph && offScreenParagraph.parentNode) {
      toRemove.push(offScreenParagraph.parentNode);
    }
    toRemove.forEach(function (e) {
      return removeElement(e);
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

    if (hide && hide.length) {
      var hideEle = $$(hide.join(','));
      Array.from(hideEle).forEach(function (ele) {
        return setOpacity(ele);
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

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = styleCache[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _step2$value = _slicedToArray(_step2.value, 2),
            selector = _step2$value[0],
            rule = _step2$value[1];

        rules += selector + ' ' + rule + '\n';
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
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
        addBlick();
        break;
      case 'spin':
        addSpin();
        break;
      case 'shine':
        addShine();
        break;
      default:
        addSpin();
        break;
    }
  }

  function getHtmlAndStyle() {
    var root = document.documentElement;
    var rawHtml = root.outerHTML;
    var styles = Array.from($$('style')).map(function (style) {
      return style.innerHTML || style.innerText;
    });
    Array.from($$(AFTER_REMOVE_TAGS.join(','))).forEach(function (ele) {
      return removeElement(ele);
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

  return exports;
}({});