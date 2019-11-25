import {NotoresModule, addConfigDefault} from '@notores/core';
import {Tag} from "./types";

class ThemeModule extends NotoresModule {

    private readonly _responder: Function;

    get themeResponder() {
        return this._responder;
    }

    constructor() {
        super();
        this._responder = require('./lib/themeResponseHandler').themeResponder;
    }

    init() {
        const Locals = require('@notores/core').Locals;
        const {middlewareForRouter} = require('@notores/core');
        const {serveStatic, checkAdminPath} = require('./lib/middleware');

        middlewareForRouter(checkAdminPath, {level: 'private'});

        middlewareForRouter(serveStatic(false));
        middlewareForRouter(serveStatic(true), {level: 'private'});

        Locals.addResponseType('html');

        Locals.addProperty('js', []);
        Locals.addProperty('css', []);
        Locals.addProperty('page', '');

        Locals.extend({
            addJS(script: string, path: boolean = true) {
                this.js.push({path, script});
            },

            addCSS(path: string) {
                this.css.push(path);
            },

            genJSTags() {
                let jsTags = '';

                const links = this.js.filter((obj: Tag) => obj.path);
                const scripts = this.js.filter((obj: Tag) => !obj.path);

                links.forEach((obj: Tag) => jsTags += `<script src="${obj.script}"></script>\n`);
                scripts.forEach((obj: Tag) => {
                    let inlineJS = obj.script.replace('<script type="text/javascript">', '');
                    inlineJS = inlineJS.replace('</script>', '');
                    jsTags += `<script type="text/javascript">${inlineJS}</script>\n`
                });

                return jsTags;
            }
        });
    }
}

export default new ThemeModule();

addConfigDefault({
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
