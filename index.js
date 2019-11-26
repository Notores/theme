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
        const { serveStatic, checkAdminPath } = require('./lib/middleware');
        core_1.middlewareForRouter(checkAdminPath, { level: "private" /* private */ });
        core_1.middlewareForRouter(serveStatic(false));
        core_1.middlewareForRouter(serveStatic(true), { level: "private" /* private */ });
        core_1.Locals.addResponseType('html');
        core_1.Locals.addProperty('js', []);
        core_1.Locals.addProperty('css', []);
        core_1.Locals.addProperty('page', '');
        core_1.Locals.extend({
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
module.exports = new ThemeModule();
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
