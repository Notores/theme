"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@notores/core");
const path_1 = require("path");
const config_1 = require("./config");
function serveStatic(admin = false) {
    return (req, res, next) => {
        if (admin && req.path.indexOf('/n-admin') === 0) {
            return next('route');
        }
        const notoresConfig = core_1.getConfig();
        const options = {
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true,
            },
        };
        const themePath = config_1.getThemePath(notoresConfig.theme, admin);
        const path = path_1.join(themePath, req.path);
        res.sendFile(path, options, err => {
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
    serveStatic,
    checkAdminPath,
};
