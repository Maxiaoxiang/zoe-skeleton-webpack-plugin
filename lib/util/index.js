'use strict';

var _require = require('util'),
    promisify = _require.promisify;

var fs = require('fs');
var os = require('os');
var path = require('path');
var fse = require('fs-extra');

var _require2 = require('html-minifier'),
    minify = _require2.minify;

var _require3 = require('html2json'),
    html2json = _require3.html2json,
    json2html = _require3.json2html;

var htmlBeautify = require('js-beautify').html_beautify;

var _require4 = require('../config/config'),
    htmlBeautifyConfig = _require4.htmlBeautifyConfig,
    moduleRouters = _require4.moduleRouters;

var getLogger = require('webpack-log');
var log = getLogger({ name: 'zoe-skeleton' });

var getCleanedShellHtml = function getCleanedShellHtml(html) {
    var STYLE_REG = /<style>[\s\S]+?<\/style>/;
    var BODY_REG = /<body>([\s\S]+?)<\/body>/;
    var css = STYLE_REG.exec(html)[0];
    var cleanHtml = BODY_REG.exec(html)[1];
    return css + '\n' + cleanHtml;
};

function htmlMinify(html, options) {
    return options === false ? htmlBeautify(html, htmlBeautifyConfig) : minify(html, options);
}

async function writeShell(routesData, options) {
    var pathname = options.pathname,
        minOptions = options.minify;

    return Promise.all(Object.keys(routesData).map(async function (route) {
        var html = routesData[route].html;
        var minifiedHtml = htmlMinify(getCleanedShellHtml(html), minOptions);
        var trimedRoute = route.replace(/\//g, '');
        var filePath = path.join(pathname, trimedRoute ? trimedRoute + '.html' : 'index.html');
        await fse.ensureDir(pathname);
        await promisify(fs.writeFile)(filePath, minifiedHtml, 'utf-8');
        return Promise.resolve();
    }));
}

function sleep(duration) {
    return new Promise(function (resolve) {
        setTimeout(resolve, duration);
    });
}

async function genScriptContent() {
    var sourcePath = path.resolve(__dirname, '../script/index.js');
    var result = await promisify(fs.readFile)(sourcePath, 'utf-8');
    return result;
}

// add script tag into html string, just as document.body.appendChild(script)
function addScriptTag(source, src, port) {
    var token = source.split('</body>');
    if (token.length < 2) return source;
    var scriptTag = '\n    <script>\n      window._pageSkeletonSocketPort = ' + port + '\n    </script>\n    <script type="text/javascript" src="' + src + '" defer></script>\n    ';
    return '' + token[0] + scriptTag + '</body>' + token[1];
}

function createLog(options) {
    console.log(options);
}

function isFunction(func) {
    return typeof func === 'function';
}

/**
 * original author: pepterbe(https://github.com/peterbe/minimalcss)
 * Take call "important comments" and extract them all to the
 * beginning of the CSS string.
 * This makes it possible to merge when minifying across blocks of CSS.
 * For example, if you have (ignore the escaping for the sake of demonstration):
 *
 *   /*! important 1 *\/
 *   p { color: red; }
 *   /*! important 2 *\/
 *   p { background-color: red; }
 *
 * You can then instead get:
 *
 *   /*! important 1 *\/
 *   /*! important 2 *\/
 *   p { color: red; background-color: red; }
 *
 * @param {string} css
 * @return {string}
 */
var collectImportantComments = function collectImportantComments(css) {
    var once = new Set();
    var cleaned = css.replace(/(\/\*![\s\S]*?\*\/)\n*/gm, function (match, p1) {
        once.add(p1);
        return '';
    });
    var combined = Array.from(once);
    combined.push(cleaned);
    return combined.join('\n');
};

var outputSkeletonScreen = async function outputSkeletonScreen(originHtml, options, log) {
    var pathname = options.pathname,
        staticDir = options.staticDir,
        routes = options.routes;

    return Promise.all(routes.map(async function (route) {
        var trimedRoute = route.replace(/\//g, '');
        var filePath = path.join(pathname, trimedRoute ? trimedRoute + '.html' : 'index.html');
        var html = await promisify(fs.readFile)(filePath, 'utf-8');
        var finalHtml = originHtml.replace('<!-- shell -->', html);
        var outputDir = path.join(staticDir, route);
        var outputFile = path.join(outputDir, 'index.html');
        await fse.ensureDir(outputDir);
        await promisify(fs.writeFile)(outputFile, finalHtml, 'utf-8');
        log('write ' + outputFile + ' successfully in ' + route);
        return Promise.resolve();
    }));
};

// Server 端主动推送消息到制定 socket
var sockWrite = function sockWrite(sockets, type, data) {
    sockets.forEach(function (sock) {
        sock.write(JSON.stringify({
            type: type, data: data
        }));
    });
};

var addDprAndFontSize = function addDprAndFontSize(html) {
    var json = html2json(html);
    var rootElement = json.child.filter(function (c) {
        return c.tag === 'html';
    })[0];
    var oriAttr = rootElement.attr;
    var style = oriAttr.style || [];
    var index = style.indexOf('font-size:');
    if (index > -1) {
        style[index + 1] = '124.2px;';
    } else {
        style.push('font-size:');
        style.push('124.2px;');
    }
    var rootAttr = Object.assign(oriAttr, {
        'data-dpr': '3',
        style: style
    });
    rootElement.attr = rootAttr;
    return json2html(json);
};

var generateQR = async function generateQR(text) {
    try {
        return await QRCode.toDataURL(text);
    } catch (err) {
        return Promise.reject(err);
    }
};

var getLocalIpAddress = function getLocalIpAddress() {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        // eslint-disable-line guard-for-in
        var iface = interfaces[devName];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = iface[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var alias = _step.value;

                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
};

var snakeToCamel = function snakeToCamel(name) {
    return name.replace(/-([a-z])/g, function (_, p1) {
        return p1.toUpperCase();
    });
};

//格式化输出结果
var formatHtml = function formatHtml(result) {
    return '<div id="mod-shell" style="position:fixed;z-index:10000;top:0;background:#fff;height:100%;width:100%"><style>' + result.styles + '</style>' + result.cleanedHtml + '</div>';
};

//匹配模块路由
var formatRouter = function formatRouter(router) {
    router = router.filter(function (s) {
        return s;
    });
    if (moduleRouters.indexOf(router[0]) < 0) {
        router.unshift('platform');
    }
    return router;
};

var writeView = async function writeView(staticDir, viewsDir, url) {
    var urlStr = url.split('?')[0];
    return new Promise(async function (resolve) {
        urlStr = urlStr.split('http://127.0.0.1:3330')[1];
        var pathArr = formatRouter(urlStr.split('/'));
        var filename = pathArr.pop() + '.html';
        var pathStr = '/' + pathArr.join('/');
        var filePath = path.join(viewsDir + pathStr, filename);
        var html = await promisify(fs.readFile)(filePath, 'utf-8');
        var htmlArr = html.split('<div id="app"></div>');
        if (html.indexOf('<!--shell-->') === -1) {
            htmlArr.splice(1, 0, '<div id="app"></div>\n<!--shell-->\n<%include ../../../public/shell' + (pathStr + '/' + filename) + ' %>');
        } else {
            htmlArr.splice(1, 0, '<div id="app"></div>');
        }
        await promisify(fs.writeFile)(filePath, htmlArr.join(''), 'utf-8');
        return resolve();
    });
};

//写入骨架屏
var writeSkeleton = async function writeSkeleton(staticDir, url, html) {
    return new Promise(async function (resolve) {
        var urlStr = url.split('?')[0];
        urlStr = urlStr.split('http://127.0.0.1:3330')[1];
        var pathArr = formatRouter(urlStr.split('/'));
        var filename = pathArr.pop() + '.html';
        var pathStr = '/' + pathArr.join('/');
        var filePath = path.join(staticDir + pathStr, filename);
        await fse.ensureDir(staticDir + pathStr);
        await promisify(fs.writeFile)(filePath, formatHtml(html), 'utf-8');
        return resolve();
    });
};

module.exports = {
    sleep: sleep,
    sockWrite: sockWrite,
    snakeToCamel: snakeToCamel,
    addScriptTag: addScriptTag,
    generateQR: generateQR,
    htmlMinify: htmlMinify,
    outputSkeletonScreen: outputSkeletonScreen,
    genScriptContent: genScriptContent,
    addDprAndFontSize: addDprAndFontSize,
    getLocalIpAddress: getLocalIpAddress,
    collectImportantComments: collectImportantComments,
    writeSkeleton: writeSkeleton,
    writeView: writeView
};