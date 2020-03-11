const fs = require('fs');
const http = require('http');
const path = require('path');
const EventEmitter = require('events');
const express = require('express');
const weblog = require('webpack-log');
const log = weblog({name: 'zoe-skeleton'});
const SkeletonBuilder = require('./skeletonCore');
const {writeSkeleton, writeView} = require('./util/index');

let skeletonBuilder = new SkeletonBuilder({
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

class Server extends EventEmitter {
    constructor(options) {
        super();
        Object.keys(options).forEach(k => Object.assign(this, {[k]: options[k]}));
        this.options = options;
    }

    initSocket() {
        const {staticDir, viewsDir} = this.options;
        const io = require('socket.io')(this.listenServer);
        //socket.io
        io.on('connection', function (socket) {
            //生成骨架屏
            socket.on('generate', async function (url) {
                log.info('当前url：', url);
                log.info('正在获取页面结构');
                const result = await skeletonBuilder.build(url);
                log.info('正在写入请稍后');
                await writeSkeleton(staticDir, url, result);
                await writeView(staticDir, viewsDir, url);
                log.info('生成完毕，请刷新并查看该路径：'+ staticDir);
            });
        });
    }

    // 启动服务
    async listen() {
        const app = this.app = express();
        const listenServer = this.listenServer = http.createServer(app);
        this.initSocket();
        listenServer.listen('8989', () => {
            log.info('socket.io listening on *:8989');
        })
    }
}

module.exports = Server;
