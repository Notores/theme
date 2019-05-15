const {NotoresModule} = require('@notores/core');
class ThemeModule extends NotoresModule {

    #responder;

    get themeResponder(){
        return this.#responder;
    }

    constructor(){
        super();
        this.#responder = require('./lib/themeResponseHandler').themeResponder;
    }

    init(){
        const Locals = require('@notores/core').Locals;
        Locals.addResponseType('html');
        Locals.extend({
            addJS(script, path = true) {
                this.js.push({path, script});
            },

            addCSS(path) {
                this.css.push(path);
            },

            genJSTags() {
                let jsTags = '';

                const links = this.js.filter(obj => obj.path);
                const scripts = this.js.filter(obj => !obj.path);

                links.forEach(obj => jsTags += `<script src="${obj.script}"></script>\n`);
                scripts.forEach(obj => {
                    let inlineJS = obj.script.replace('<script type="text/javascript">', '');
                    inlineJS = inlineJS.replace('</script>', '');
                    jsTags += `<script type="text/javascript">${inlineJS}</script>\n`
                });

                return jsTags;
            }
        });
    }
}

module.exports = new ThemeModule();
