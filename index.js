"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@notores/core");
var ThemeModule = /** @class */ (function (_super) {
    __extends(ThemeModule, _super);
    function ThemeModule() {
        var _this = _super.call(this) || this;
        _this._responder = require('./lib/themeResponseHandler').themeResponder;
        return _this;
    }
    Object.defineProperty(ThemeModule.prototype, "themeResponder", {
        get: function () {
            return this._responder;
        },
        enumerable: true,
        configurable: true
    });
    ThemeModule.prototype.init = function () {
        var Locals = require('@notores/core').Locals;
        var middlewareForRouter = require('@notores/core').middlewareForRouter;
        var _a = require('./lib/middleware'), serveStatic = _a.serveStatic, checkAdminPath = _a.checkAdminPath;
        middlewareForRouter(checkAdminPath, { level: 'private' });
        middlewareForRouter(serveStatic(false));
        middlewareForRouter(serveStatic(true), { level: 'private' });
        Locals.addResponseType('html');
        Locals.addProperty('js', []);
        Locals.addProperty('css', []);
        Locals.addProperty('page', '');
        Locals.extend({
            addJS: function (script, path) {
                if (path === void 0) { path = true; }
                this.js.push({ path: path, script: script });
            },
            addCSS: function (path) {
                this.css.push(path);
            },
            genJSTags: function () {
                var jsTags = '';
                var links = this.js.filter(function (obj) { return obj.path; });
                var scripts = this.js.filter(function (obj) { return !obj.path; });
                links.forEach(function (obj) { return jsTags += "<script src=\"" + obj.script + "\"></script>\n"; });
                scripts.forEach(function (obj) {
                    var inlineJS = obj.script.replace('<script type="text/javascript">', '');
                    inlineJS = inlineJS.replace('</script>', '');
                    jsTags += "<script type=\"text/javascript\">" + inlineJS + "</script>\n";
                });
                return jsTags;
            }
        });
    };
    return ThemeModule;
}(core_1.NotoresModule));
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
