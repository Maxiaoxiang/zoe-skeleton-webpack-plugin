const weblog = require('webpack-log');
const log = weblog({name: 'zoe-skeleton'});
const Server = require('./server');

function SkeletonPlugin(options = {}) {
  this.options = options;
}

SkeletonPlugin.prototype.createServer = function () {
  const server = new Server(this.options);
  server.listen().catch(err => log.warn(err));
};

SkeletonPlugin.prototype.apply = function (compiler) {
  this.createServer();
};

module.exports = SkeletonPlugin;
