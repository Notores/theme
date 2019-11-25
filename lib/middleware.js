"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@notores/core");
var path_1 = require("path");
var config_1 = require("./config");
function serveStatic(admin) {
    if (admin === void 0) { admin = false; }
    return function (req, res, next) {
        if (admin && req.path.indexOf('/n-admin') === 0) {
            return next('route');
        }
        var notoresConfig = core_1.getConfig();
        var options = {
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true,
            },
        };
        var themePath = config_1.getThemePath(notoresConfig.theme, admin);
        var path = path_1.join(themePath, req.path);
        res.sendFile(path, options, function (err) {
            if (err) {
                return next();
            }
        });
    };
}
function checkAdminPath(req, res, next) {
    if (req.originalUrl === '/n-admin') {
        return res.redirect('/n-admin/');
    }
    next();
}
module.exports = {
    serveStatic: serveStatic,
    checkAdminPath: checkAdminPath,
};
