"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@notores/core");
class ThemeModule extends core_1.NotoresModule {
    constructor() {
        super();
        this._responder = require('./lib/themeResponseHandler').themeResponder;
    }
    get themeResponder() {
        return this._responder;
    }
    init() {
        const Locals = require('@notores/core').Locals;
        const { middlewareForRouter } = require('@notores/core');
        const { serveStatic, checkAdminPath } = require('./lib/middleware');
        middlewareForRouter(checkAdminPath, { level: 'private' });
        middlewareForRouter(serveStatic(false));
        middlewareForRouter(serveStatic(true), { level: 'private' });
        Locals.addResponseType('html');
        Locals.addProperty('js', []);
        Locals.addProperty('css', []);
        Locals.addProperty('page', '');
        Locals.extend({
            addJS(script, path = true) {
                this.js.push({ path, script });
            },
            addCSS(path) {
                this.css.push(path);
            },
            genJSTags() {
                let jsTags = '';
                const links = this.js.filter((obj) => obj.path);
                const scripts = this.js.filter((obj) => !obj.path);
                links.forEach((obj) => jsTags += `<script src="${obj.script}"></script>\n`);
                scripts.forEach((obj) => {
                    let inlineJS = obj.script.replace('<script type="text/javascript">', '');
                    inlineJS = inlineJS.replace('</script>', '');
                    jsTags += `<script type="text/javascript">${inlineJS}</script>\n`;
                });
                return jsTags;
            }
        });
    }
}
exports.default = new ThemeModule();
core_1.addConfigDefault({
    key: 'theme',
    value: {
        public: {
            name: 'notores',
            isApp: false
        },
        private: {
            name: 'notores',
            isApp: true
        },
    }
});
