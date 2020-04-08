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

function htmlMinify(html, options) {
    return options === false ? htmlBeautify(html, htmlBeautifyConfig) : minify(html, options);
}

function sleep(duration) {
    return new Promise(function (resolve) {
        setTimeout(resolve, duration);
    });
}

async function genScriptContent() {
    var sourcePath = path.resolve(__dirname, '../script/index.js');
    return await promisify(fs.readFile)(sourcePath, 'utf-8');
}

// add script tag into html string, just as document.body.appendChild(script)
function addScriptTag(source, src, port) {
    var token = source.split('</body>');
    if (token.length < 2) return source;
    var scriptTag = '\n    <script>\n      window._pageSkeletonSocketPort = ' + port + '\n    </script>\n    <script type="text/javascript" src="' + src + '" defer></script>\n    ';
    return '' + token[0] + scriptTag + '</body>' + token[1];
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
/**
 * 检测指定目录下指定文件夹/文件是否存在
 * @param {String} fullpath 指定目录/文件本地路径
 * @return {Boolean} 是否存在文件/文件夹
 */
var isExist = function isExist(fullpath) {
    return fs.existsSync(fullpath);
};

//写入views模板文件引入（新版title-config路口开放后该功能未来可能移除）
var writeView = async function writeView(staticDir, viewsDir, url) {
    var urlStr = url.split('?')[0];
    return new Promise(async function (resolve) {
        urlStr = urlStr.split('http://127.0.0.1:3330')[1];
        var pathArr = formatRouter(urlStr.split('/'));
        var filename = pathArr.pop() + '.html';
        var pathStr = '/' + pathArr.join('/');
        var filePath = path.join(viewsDir + pathStr, filename);
        if (isExist(filePath)) {
            var html = await promisify(fs.readFile)(filePath, 'utf-8');
            var htmlArr = html.split('<div id="app"></div>');
            if (html.indexOf('<!--shell-->') === -1) {
                htmlArr.splice(1, 0, '<div id="app"></div>\n<!--shell-->\n<%include ../../../public/shell' + (pathStr + '/' + filename) + ' %>');
            } else {
                htmlArr.splice(1, 0, '<div id="app"></div>');
            }
            await promisify(fs.writeFile)(filePath, htmlArr.join(''), 'utf-8');
            return resolve();
        } else {
            return resolve();
        }
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
    addScriptTag: addScriptTag,
    htmlMinify: htmlMinify,
    genScriptContent: genScriptContent,
    addDprAndFontSize: addDprAndFontSize,
    collectImportantComments: collectImportantComments,
    writeSkeleton: writeSkeleton,
    writeView: writeView
};