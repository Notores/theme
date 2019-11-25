import {getConfig} from '@notores/core';
import log from '@notores/core/logger'
import {join} from "path";
import {Request, Response} from 'express';
import {getThemePath} from "./config";
import {render} from 'ejs';
import * as renderFile from 'express-ejs-extend';
import handlebars from 'handlebars';
import {ThemeConfig} from "../types";
import {constants, promises} from "fs";
import access = promises.access;

const logger = log(module);

const themeResponder = async (req: Request, res: Response): Promise<void> => {
    const themeConfig = getConfig('theme');
    await responder(req, res, themeConfig, req.app.mountpath !== '/');
};

const responder = async (req: Request, res: Response, themeConfig: any, admin: boolean): Promise<void> => {
    const themePath = getThemePath(themeConfig, admin);
    const filename = await getFileName(themeConfig[admin ? 'private' : 'public'], themePath, req.path, res.locals.page);
    renderTemplate(join(themePath, filename), res.locals)
        .then(html => res.send(html))
        .catch(error => {
            // @ts-ignore
            logger.error(`Error rendering template "${filename}" in path ${themePath}. Error: ${error.message}`);
            res.send(`
                <h1>Something went wrong</h1>
                <p>This is most likely a server error. Please try again at a later time</p>
            `);
        });
};

const renderTemplate = async (filePath: string, locals: any) => {
    const myRender = (filePath: string, locals: any) => {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            renderFile(filePath, locals, (err: Error, html: string) => {
                if (err) {
                    return reject(err);
                }
                return resolve(html);
            });
        });
    };

    let ejsRender: string = <string>await myRender(filePath, locals);

    // If the post, page or product has EJS rendering in it, render again so that also has renders done
    if (ejsRender.indexOf('<%') > -1 && ejsRender.indexOf('%>') > -1) {
        //TODO: This should work, but not 100% sure
        ejsRender = render(ejsRender, locals, {
            filename: filePath,
            cache: false,
        });
    }

    const hbsTemplate = handlebars.compile(ejsRender);
    return hbsTemplate(locals);
};

const getFileName = async (themeTypeConfig: ThemeConfig, themePath: string, path: string, page: string | number): Promise<string> => {
    let checkFilenames = [];

    if (themeTypeConfig.isApp) {
        // SPA's work from 1 index.html file
        checkFilenames.push('index.ejs');
        checkFilenames.push('index.html');
    } else {
        if (page) {
            checkFilenames.push(`${page}.ejs`);
            checkFilenames.push(`/pages/${page}.ejs`);
            checkFilenames.push(`${page}.html`);
        }
        if (path === '/') {
            checkFilenames.push(`index.ejs`);
            checkFilenames.push(`/pages/index.ejs`);
            checkFilenames.push(`index.html`);
        }

        checkFilenames.push(path);
        checkFilenames.push(`${path}.ejs`);
        checkFilenames.push(`/pages${path}.ejs`);
        checkFilenames.push(`${path}.html`);
    }

    for (let i = 0; i < checkFilenames.length; i++) {
        try {
            const path = join(themePath, '/', checkFilenames[i]);
            await access(path, constants.R_OK);
            return checkFilenames[i];
        } catch (e) {
            // return 'index.html';
        }
    }

    // @ts-ignore
    logger.error(`None of paths "${checkFilenames.join(', ')}" exist`);

    return page === 404 ? 'ERROR' : await getFileName(themeTypeConfig, themePath, path, 404);
};

module.exports = {
    themeResponder,
};
