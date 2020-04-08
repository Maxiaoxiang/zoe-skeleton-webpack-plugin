'use strict'

const {promisify} = require('util')
const fs = require('fs')
const os = require('os')
const path = require('path')
const fse = require('fs-extra')
const {minify} = require('html-minifier')
const {html2json, json2html} = require('html2json')
const htmlBeautify = require('js-beautify').html_beautify
const {htmlBeautifyConfig, moduleRouters} = require('../config/config')

function htmlMinify(html, options) {
    return options === false ? htmlBeautify(html, htmlBeautifyConfig) : minify(html, options)
}

function sleep(duration) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration)
    })
}

async function genScriptContent() {
    const sourcePath = path.resolve(__dirname, '../script/index.js')
    return await promisify(fs.readFile)(sourcePath, 'utf-8')
}

// add script tag into html string, just as document.body.appendChild(script)
function addScriptTag(source, src, port) {
    const token = source.split('</body>')
    if (token.length < 2) return source
    const scriptTag = `
    <script>
      window._pageSkeletonSocketPort = ${port}
    </script>
    <script type="text/javascript" src="${src}" defer></script>
    `
    return `${token[0]}${scriptTag}</body>${token[1]}`
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
const collectImportantComments = (css) => {
    const once = new Set();
    const cleaned = css.replace(/(\/\*![\s\S]*?\*\/)\n*/gm, (match, p1) => {
        once.add(p1);
        return ''
    });
    const combined = Array.from(once);
    combined.push(cleaned);
    return combined.join('\n');
};

const addDprAndFontSize = (html) => {
    const json = html2json(html)
    const rootElement = json.child.filter(c => c.tag === 'html')[0]
    const oriAttr = rootElement.attr
    const style = oriAttr.style || []
    const index = style.indexOf('font-size:')
    if (index > -1) {
        style[index + 1] = '124.2px;'
    } else {
        style.push('font-size:')
        style.push('124.2px;')
    }
    const rootAttr = Object.assign(oriAttr, {
        'data-dpr': '3',
        style
    })
    rootElement.attr = rootAttr
    return json2html(json)
}

//格式化输出结果
const formatHtml = (result) => {
    return `<div id="mod-shell" style="position:fixed;z-index:10000;top:0;background:#fff;height:100%;width:100%"><style>${result.styles}</style>${result.cleanedHtml}</div>`;
};

//匹配模块路由
const formatRouter = (router) => {
    router = router.filter(function (s) {
        return s;
    });
    if(moduleRouters.indexOf(router[0]) < 0) {
        router.unshift('platform');
    }
    return router;
};
/**
 * 检测指定目录下指定文件夹/文件是否存在
 * @param {String} fullpath 指定目录/文件本地路径
 * @return {Boolean} 是否存在文件/文件夹
 */
let isExist = function (fullpath) {
    return fs.existsSync(fullpath);
};


//写入views模板文件引入（新版title-config路口开放后该功能未来可能移除）.
const writeView = async (staticDir, viewsDir, url) => {
    let urlStr = url.split('?')[0];
    return new Promise((async (resolve) => {
        urlStr = urlStr.split('http://127.0.0.1:3330')[1];
        let pathArr = formatRouter(urlStr.split('/'));
        let filename = pathArr.pop() + '.html';
        let pathStr = '/' + pathArr.join('/');
        const filePath = path.join(viewsDir + pathStr, filename);
        if (isExist(filePath)) {
            const html = await promisify(fs.readFile)(filePath, 'utf-8');
            let htmlArr = html.split('<div id="app"></div>');
            if(html.indexOf('<!--shell-->') === -1) {
                htmlArr.splice(1, 0, `<div id="app"></div>\n<!--shell-->\n<%include ../../../public/shell${pathStr+'/'+filename} %>`);
            } else {
                htmlArr.splice(1, 0, `<div id="app"></div>`);
            }
            await promisify(fs.writeFile)(filePath, htmlArr.join(''), 'utf-8');
            return resolve();
        } else {
            return resolve();
        }
    }));
};

//写入骨架屏
const writeSkeleton = async (staticDir, url, html) => {
    return new Promise(async (resolve) => {
        let urlStr = url.split('?')[0];
        urlStr = urlStr.split('http://127.0.0.1:3330')[1];
        let pathArr = formatRouter(urlStr.split('/'));
        let filename = pathArr.pop() + '.html';
        let pathStr = '/' + pathArr.join('/');
        const filePath = path.join(staticDir + pathStr, filename);
        await fse.ensureDir(staticDir + pathStr);
        await promisify(fs.writeFile)(filePath, formatHtml(html), 'utf-8');
        return resolve();
    });
};

module.exports = {
    sleep,
    addScriptTag,
    htmlMinify,
    genScriptContent,
    addDprAndFontSize,
    collectImportantComments,
    writeSkeleton,
    writeView
}
