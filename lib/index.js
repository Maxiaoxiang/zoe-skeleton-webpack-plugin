'use strict';

var weblog = require('webpack-log');
var log = weblog({ name: 'zoe-skeleton' });

var _require = require('./util/index'),
    writeSkeleton = _require.writeSkeleton;

var Server = require('./server');

function SkeletonPlugin() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  this.options = options;
  this.server = null;
  log.info(options);
}

SkeletonPlugin.prototype.createServer = function () {
  var server = this.server = new Server(this.options);
  server.listen().catch(function (err) {
    return log.warn(err);
  });
};

SkeletonPlugin.prototype.apply = function (compiler) {
  this.createServer();
};

module.exports = SkeletonPlugin;