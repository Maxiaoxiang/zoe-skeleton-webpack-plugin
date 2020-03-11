'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// rollup.config.js
exports.default = {
  input: 'src/script/main.js',
  output: {
    file: 'src/script/index.js',
    format: 'iife',
    name: 'Skeleton'
  }
};