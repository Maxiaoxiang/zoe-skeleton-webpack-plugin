'use strict';
const chai = require('chai');
const replaceShell = require('../src');

const expect = chai.expect;

describe('测试开始', () => {
  it('test', function() {
    expect(replaceShell('mss'));
  });
});
