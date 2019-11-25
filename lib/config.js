"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
exports.getThemePath = function (themeConfig, admin) {
    if (admin === void 0) { admin = false; }
    var config = admin ? themeConfig.private : themeConfig.public;
    var path = '';
    if (config.absolutePath) {
        if (config.absolutePath.indexOf(':root') === 0) {
            path = path_1.join(process.cwd(), path.replace(':root', ''));
        }
        else {
            path = config.absolutePath;
        }
    }
    else {
        path = path_1.join(process.cwd(), './public', './themes', admin ? "/" + themeConfig.private.name || '/notores' : "/" + themeConfig.public.name || '/notores', admin ? '/private' : '/public');
    }
    return path;
};
