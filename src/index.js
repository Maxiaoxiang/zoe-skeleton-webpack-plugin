const weblog = require('webpack-log');
const log = weblog({name: 'zoe-skeleton'});
const {writeSkeleton} = require('./util/index');
const Server = require('./server');

function SkeletonPlugin(options = {}) {
  this.options = options;
  this.server = null;
  log.info(options);
}

SkeletonPlugin.prototype.createServer = function () {
  const server = this.server = new Server(this.options);
  server.listen().catch(err => log.warn(err));
};

SkeletonPlugin.prototype.apply = function (compiler) {
  this.createServer();
};

module.exports = SkeletonPlugin;
