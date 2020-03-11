'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var puppeteer = require('puppeteer');
var devices = require('puppeteer/DeviceDescriptors');

var _require = require('css-tree'),
    parse = _require.parse,
    toPlainObject = _require.toPlainObject,
    fromPlainObject = _require.fromPlainObject,
    generate = _require.generate;

var _require2 = require('./util'),
    sleep = _require2.sleep,
    genScriptContent = _require2.genScriptContent,
    htmlMinify = _require2.htmlMinify,
    collectImportantComments = _require2.collectImportantComments;

var _require3 = require('./config/config'),
    defaultOptions = _require3.defaultOptions;

var SkeletonCore = function () {
    function SkeletonCore() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, SkeletonCore);

        this.options = Object.assign({}, defaultOptions, options);
        this.browser = null;
        this.scriptContent = '';
    }

    _createClass(SkeletonCore, [{
        key: 'initialize',
        value: async function initialize() {
            var options = this.options;

            var openDevTools = !!options.preview;
            var headless = !options.preview;
            try {
                this.scriptContent = await genScriptContent();

                this.browser = await puppeteer.launch({
                    //设置超时时间
                    timeout: options.timeout,
                    //如果是访问https页面 此属性会忽略https错误
                    ignoreHTTPSErrors: true,
                    // 打开开发者工具, 当此值为true时, headless总为false
                    devtools: openDevTools,
                    // 关闭headless模式, 不会打开浏览器
                    headless: headless
                });
            } catch (err) {
                // TODO LOG
                throw new Error('puppeteer launch error\uFF1A' + err);
            }
        }
    }, {
        key: 'newPage',
        value: async function newPage() {
            var _options = this.options,
                device = _options.device,
                debug = _options.debug;

            var page = await this.browser.newPage();
            await page.emulate(devices[device]);
            if (debug) {
                page.on('console', function () {
                    var _console;

                    (_console = console).info.apply(_console, arguments);
                });
            }
            return page;
        }
    }, {
        key: 'makeSkeleton',
        value: async function makeSkeleton(page) {
            var defer = this.options.defer;

            await page.addScriptTag({ content: this.scriptContent });
            await sleep(defer);
            await page.evaluate(function (options) {
                Skeleton.genSkeleton(options);
            }, this.options);
        }
    }, {
        key: 'build',
        value: async function build(url, options) {
            await this.initialize();
            var stylesheetAstObjects = {};
            var stylesheetContents = {};
            var page = await this.newPage();
            var _options2 = this.options,
                cookies = _options2.cookies,
                preview = _options2.preview,
                waitForSelector = _options2.waitForSelector,
                _options2$storagies = _options2.storagies,
                storagies = _options2$storagies === undefined ? {} : _options2$storagies,
                _options2$sessionStor = _options2.sessionStoragies,
                sessionStoragies = _options2$sessionStor === undefined ? {} : _options2$sessionStor;

            /**************************page 事件****************************/

            await page.setRequestInterception(true);
            page.on('request', function (request) {
                if (stylesheetAstObjects[request.url]) {
                    request.abort();
                } else {
                    request.continue();
                }
            });

            page.on('response', function (response) {
                var requestUrl = response.url();
                var ct = response.headers()['content-type'] || '';
                // if (response.ok && !response.ok()) {
                //     throw new Error(`${response.status()} on ${requestUrl}`)
                // }

                if (ct.indexOf('text/css') > -1 || /\.css$/i.test(requestUrl)) {
                    response.text().then(function (text) {
                        var ast = parse(text, {
                            parseValue: false,
                            parseRulePrelude: false
                        });
                        stylesheetAstObjects[requestUrl] = toPlainObject(ast);
                        stylesheetContents[requestUrl] = text;
                    });
                }
            });

            page.on('pageerror', function (error) {
                throw error;
            });

            /**************************page 事件****************************/

            if (cookies.length) {
                await page.setCookie.apply(page, _toConsumableArray(cookies.filter(function (cookie) {
                    return (typeof cookie === 'undefined' ? 'undefined' : _typeof(cookie)) === 'object';
                })));
            }

            var response = await page.goto(url, { waitUntil: 'networkidle2' });

            if (Object.keys(storagies).length) {
                await page.evaluate(function (storagies) {
                    for (var item in storagies) {
                        if (storagies.hasOwnProperty(item)) {
                            localStorage.setItem(item, storagies[item]);
                        }
                    }
                }, storagies);
            }

            if (Object.keys(sessionStoragies).length) {
                await page.evaluate(function (sessionStoragies) {
                    for (var item in sessionStoragies) {
                        if (sessionStoragies.hasOwnProperty(item)) {
                            sessionStorage.setItem(item, sessionStoragies[item]);
                        }
                    }
                }, sessionStoragies);
            }

            // 注意必须是200状态码
            if (response && !response.ok()) {
                throw new Error(response.status + ' on ' + url);
            }

            if (waitForSelector) await page.waitForSelector(waitForSelector);

            await this.makeSkeleton(page);

            // 预览模式
            if (preview) return Promise.resolve(true);

            var _ref = await page.evaluate(function () {
                return Skeleton.getHtmlAndStyle();
            }),
                styles = _ref.styles,
                cleanedHtml = _ref.cleanedHtml;

            var stylesheetAstArray = styles.map(function (style) {
                var ast = parse(style, {
                    parseValue: false,
                    parseRulePrelude: false
                });
                return toPlainObject(ast);
            });

            // eslint-disable-line no-shadow
            var cleanedCSS = await page.evaluate(async function (stylesheetAstObjects, stylesheetAstArray) {
                var DEAD_OBVIOUS = new Set(['*', 'body', 'html']);
                var cleanedStyles = [];

                var checker = function checker(selector) {
                    if (DEAD_OBVIOUS.has(selector)) {
                        return true;
                    }
                    if (/:-(ms|moz)-/.test(selector)) {
                        return true;
                    }
                    if (/:{1,2}(before|after)/.test(selector)) {
                        return true;
                    }
                    try {
                        return !!document.querySelector(selector);
                    } catch (err) {
                        var exception = err.toString();
                        console.log('Unable to querySelector(\'' + selector + '\') [' + exception + ']', 'error'); // eslint-disable-line no-console
                        return false;
                    }
                };

                var cleaner = function cleaner(ast, callback) {
                    var decisionsCache = {};

                    var clean = function clean(children, cb) {
                        return children.filter(function (child) {
                            if (child.type === 'Rule') {
                                var values = child.prelude.value.split(',').map(function (x) {
                                    return x.trim();
                                });
                                var keepValues = values.filter(function (selectorString) {
                                    if (decisionsCache[selectorString]) {
                                        return decisionsCache[selectorString];
                                    }
                                    var keep = cb(selectorString);
                                    decisionsCache[selectorString] = keep;
                                    return keep;
                                });
                                if (keepValues.length) {
                                    // re-write the selector value
                                    child.prelude.value = keepValues.join(', ');
                                    return true;
                                }
                                return false;
                            } else if (child.type === 'Atrule' && child.name === 'media') {
                                // recurse
                                child.block.children = clean(child.block.children, cb);
                                return child.block.children.length > 0;
                            }
                            // The default is to keep it.
                            return true;
                        });
                    };

                    ast.children = clean(ast.children, callback);
                    return ast;
                };

                var links = Array.from(document.querySelectorAll('link'));

                links.filter(function (link) {
                    return link.href && (link.rel === 'stylesheet' || link.href.toLowerCase().endsWith('.css')) && !link.href.toLowerCase().startsWith('blob:') && link.media !== 'print';
                }).forEach(function (stylesheet) {
                    if (!stylesheetAstObjects[stylesheet.href]) {
                        // ignore error
                        console.error(stylesheet.href + ' not in stylesheetAstObjects');
                        return;
                        // throw new Error(`${stylesheet.href} not in stylesheetAstObjects`)
                    }
                    if (!Object.keys(stylesheetAstObjects[stylesheet.href]).length) {
                        // If the 'stylesheetAstObjects[stylesheet.href]' thing is an
                        // empty object, simply skip this link.
                        return;
                    }
                    var ast = stylesheetAstObjects[stylesheet.href];
                    cleanedStyles.push(cleaner(ast, checker));
                });
                stylesheetAstArray.forEach(function (ast) {
                    cleanedStyles.push(cleaner(ast, checker));
                });

                return cleanedStyles;
            }, stylesheetAstObjects, stylesheetAstArray);
            var allCleanedCSS = cleanedCSS.map(function (ast) {
                var cleanedAst = fromPlainObject(ast);
                return generate(cleanedAst);
            }).join('\n');
            var finalCss = collectImportantComments(allCleanedCSS);
            // finalCss = minify(finalCss).css ? `html-minifier` use `clean-css` as css minifier
            // so don't need to use another mimifier.
            var h5Meta = '<meta name="viewport" content="initial-scale=1.0,user-scalable=no,maximum-scale=1,width=device-width"/>';
            var shellHtml = '<!DOCTYPE html>\n            <html lang="en">\n            <head>\n            <meta charset="UTF-8">\n            <meta name="viewport" content="initial-scale=1.0,user-scalable=no,maximum-scale=1,width=device-width"/>\n            <title>Page Skeleton</title>\n            <style>\n              $$css$$\n            </style>\n            </head>\n            <body>\n            $$html$$\n            </body>\n            </html>';
            shellHtml = shellHtml.replace('$$css$$', finalCss).replace('$$html$$', cleanedHtml);
            var result = {
                html: htmlMinify(shellHtml, false),
                styles: finalCss,
                cleanedHtml: cleanedHtml
            };

            await this.closePage(page);
            return Promise.resolve(result);
        }
    }, {
        key: 'closePage',
        value: async function closePage(page) {
            await page.close();
            return this;
        }
    }]);

    return SkeletonCore;
}();

module.exports = SkeletonCore;