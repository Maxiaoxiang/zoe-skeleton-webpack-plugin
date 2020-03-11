'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

exports.default = listHandle;