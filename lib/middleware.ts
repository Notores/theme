import {getConfig} from '@notores/core';
import {join} from "path";
import {getThemePath} from "./config";
import {Request, Response, NextFunction} from 'express';

function serveStatic(admin = false) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (admin && req.path.indexOf('/n-admin') === 0) {
            return next('route');
        }

        const notoresConfig = getConfig();

        const options = {
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true,
            },
        };

        const themePath = getThemePath(notoresConfig.theme, admin);
        const path = join(themePath, req.path);

        res.sendFile(path, options, err => {
            if (err) {
                return next();
            }
        });
    };
}

function checkAdminPath(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl === '/n-admin') {
        return res.redirect('/n-admin/');
    }

    next();
}

module.exports = {
    serveStatic,
    checkAdminPath,
};
