"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@notores/core");
const logger_1 = __importDefault(require("@notores/core/logger"));
const path_1 = require("path");
const config_1 = require("./config");
const ejs_1 = require("ejs");
const renderFile = __importStar(require("express-ejs-extend"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = require("fs");
var access = fs_1.promises.access;
const logger = logger_1.default(module);
const themeResponder = async (req, res) => {
    const themeConfig = core_1.getConfig('theme');
    await responder(req, res, themeConfig, req.app.mountpath !== '/');
};
const responder = async (req, res, themeConfig, admin) => {
    const themePath = config_1.getThemePath(themeConfig, admin);
    const filename = await getFileName(themeConfig[admin ? 'private' : 'public'], themePath, req.path, res.locals.page);
    renderTemplate(path_1.join(themePath, filename), res.locals)
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
const renderTemplate = async (filePath, locals) => {
    const myRender = (filePath, locals) => {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            renderFile(filePath, locals, (err, html) => {
                if (err) {
                    return reject(err);
                }
                return resolve(html);
            });
        });
    };
    let ejsRender = await myRender(filePath, locals);
    // If the post, page or product has EJS rendering in it, render again so that also has renders done
    if (ejsRender.indexOf('<%') > -1 && ejsRender.indexOf('%>') > -1) {
        //TODO: This should work, but not 100% sure
        ejsRender = ejs_1.render(ejsRender, locals, {
            filename: filePath,
            cache: false,
        });
    }
    const hbsTemplate = handlebars_1.default.compile(ejsRender);
    return hbsTemplate(locals);
};
const getFileName = async (themeTypeConfig, themePath, path, page) => {
    let checkFilenames = [];
    if (themeTypeConfig.isApp) {
        // SPA's work from 1 index.html file
        checkFilenames.push('index.ejs');
        checkFilenames.push('index.html');
    }
    else {
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
            const path = path_1.join(themePath, '/', checkFilenames[i]);
            await access(path, fs_1.constants.R_OK);
            return checkFilenames[i];
        }
        catch (e) {
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
