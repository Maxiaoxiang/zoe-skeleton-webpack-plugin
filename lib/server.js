'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var fs = require('fs');
var http = require('http');
var path = require('path');
var EventEmitter = require('events');
var express = require('express');
var weblog = require('webpack-log');
var log = weblog({ name: 'zoe-skeleton' });
var SkeletonBuilder = require('./skeletonCore');

var _require = require('./util/index'),
    writeSkeleton = _require.writeSkeleton,
    writeView = _require.writeView;

var skeletonBuilder = new SkeletonBuilder({
    preview: false,
    defer: 5000,
    device: 'iPhone 6',
    image: {
        shape: 'rect',
        color: '#EFEFEF',
        shapeOpposite: [],
        fixedSize: true
    }
}, console.log);

var Server = function (_EventEmitter) {
    _inherits(Server, _EventEmitter);

    function Server(options) {
        _classCallCheck(this, Server);

        var _this = _possibleConstructorReturn(this, (Server.__proto__ || Object.getPrototypeOf(Server)).call(this));

        Object.keys(options).forEach(function (k) {
            return Object.assign(_this, _defineProperty({}, k, options[k]));
        });
        _this.options = options;
        return _this;
    }

    _createClass(Server, [{
        key: 'initSocket',
        value: function initSocket() {
            var _options = this.options,
                staticDir = _options.staticDir,
                viewsDir = _options.viewsDir;

            var io = require('socket.io')(this.listenServer);
            //socket.io
            io.on('connection', function (socket) {
                //生成骨架屏
                socket.on('generate', async function (url) {
                    log.info('当前url：', url);
                    log.info('正在获取页面结构');
                    var result = await skeletonBuilder.build(url);
                    log.info('正在写入请稍后');
                    await writeSkeleton(staticDir, url, result);
                    await writeView(staticDir, viewsDir, url);
                    log.info('生成完毕，请刷新并查看该路径：' + staticDir);
                });
            });
        }

        // 启动服务

    }, {
        key: 'listen',
        value: async function listen() {
            var app = this.app = express();
            var listenServer = this.listenServer = http.createServer(app);
            this.initSocket();
            listenServer.listen('8989', function () {
                log.info('socket.io listening on *:8989');
            });
        }
    }]);

    return Server;
}(EventEmitter);

module.exports = Server;