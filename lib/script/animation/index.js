'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var addBlick = exports.addBlick = function addBlick() {
  var style = document.createElement('style');
  var styleContent = '\n      @keyframes blink {\n        0% {\n          opacity: .4;\n        }\n\n        50% {\n          opacity: 1;\n        }\n\n        100% {\n          opacity: .4;\n        }\n      }\n      .blink {\n        animation-duration: 2s;\n        animation-name: blink;\n        animation-iteration-count: infinite;\n      }\n    ';
  style.innerHTML = styleContent;
  document.head.appendChild(style);
  document.body.firstElementChild.classList.add('blink');
};

var addShine = exports.addShine = function addShine() {
  var style = document.createElement('style');
  var styleContent = '\n      body {\n        overflow: hidden;\n      }\n      @keyframes flush {\n        0% {\n          left: -100%;\n        }\n        50% {\n          left: 0;\n        }\n        100% {\n          left: 100%;\n        }\n      }\n      .sk-loading {\n        animation: flush 2s linear infinite;\n        position: absolute;\n        top: 0;\n        bottom: 0;\n        width: 100%;\n        background: linear-gradient(to left, \n          rgba(255, 255, 255, 0) 0%,\n          rgba(255, 255, 255, .85) 50%,\n          rgba(255, 255, 255, 0) 100%\n        )\n      }\n    ';
  style.innerHTML = styleContent;
  var load = document.createElement('div');
  load.classList.add('sk-loading');
  document.head.appendChild(style);
  document.body.appendChild(load);
};

var addSpin = exports.addSpin = function addSpin() {
  var style = document.createElement('style');
  var styleContent = '\n      @keyframes loading-rotate {\n        100% {\n          transform: rotate(360deg);\n        }\n      }\n\n      @keyframes loading-dash {\n        0% {\n          stroke-dasharray: 1, 200;\n          stroke-dashoffset: 0;\n        }\n        50% {\n          stroke-dasharray: 90, 150;\n          stroke-dashoffset: -40px;\n        }\n        100% {\n          stroke-dasharray: 90, 150;\n          stroke-dashoffset: -120px;\n        }\n      }\n\n      .sk-loading-spinner {\n        top: 50%;\n        margin-top: -0.5rem;\n        width: 100%;\n        text-align: center;\n        position: absolute;\n      }\n\n      .sk-loading-spinner .circular {\n        height: 1rem;\n        width: 1rem;\n        animation: loading-rotate 2s linear infinite;\n      }\n\n      .sk-loading-spinner .path {\n        animation: loading-dash 1.5s ease-in-out infinite;\n        stroke-dasharray: 90,150;\n        stroke-dashoffset: 0;\n        stroke-width: 2;\n        stroke: #409eff;\n        stroke-linecap: round;\n      }\n    ';
  style.innerHTML = styleContent;
  document.head.appendChild(style);
  var spinContainer = document.createElement('div');
  spinContainer.classList.add('sk-loading-spinner');
  spinContainer.innerHTML = '<svg viewBox="25 25 50 50" class="circular"><circle cx="50" cy="50" r="20" fill="none" class="path"></circle></svg>';
  document.body.appendChild(spinContainer);
};