'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

require('src/common/js/babel-helper');

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _shell = require('./shell.vue');

var _shell2 = _interopRequireDefault(_shell);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = new _vue2.default(_shell2.default);