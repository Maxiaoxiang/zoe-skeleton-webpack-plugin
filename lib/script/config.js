'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
* constants
*/
var TRANSPARENT = exports.TRANSPARENT = 'transparent';
var EXT_REG = exports.EXT_REG = /\.(jpeg|jpg|png|gif|svg|webp)/;
var GRADIENT_REG = exports.GRADIENT_REG = /gradient/;
var DISPLAY_NONE = exports.DISPLAY_NONE = /display:\s*none/;
var PRE_REMOVE_TAGS = exports.PRE_REMOVE_TAGS = ['script'];
var AFTER_REMOVE_TAGS = exports.AFTER_REMOVE_TAGS = ['title', 'meta', 'style'];
var SKELETON_STYLE = exports.SKELETON_STYLE = 'sk-style';
var CLASS_NAME_PREFEX = exports.CLASS_NAME_PREFEX = 'sk-';
var CONSOLE_SELECTOR = exports.CONSOLE_SELECTOR = '.sk-console';
// 最小 1 * 1 像素的透明 gif 图片
var SMALLEST_BASE64 = exports.SMALLEST_BASE64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
var MOCK_TEXT_ID = exports.MOCK_TEXT_ID = 'sk-text-id';
var Node = exports.Node = window.Node;