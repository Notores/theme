const { getConfig } = require('@notores/core');
const { getThemePath } = require('./config');
const logger = require('@notores/core/logger')(module);
const {join} = require('path');
const {promisify} = require('util');
const {render} = require('ejs');
const renderFile = require('express-ejs-extend');
const handlebars = require('handlebars');
const fs = require('fs');
const constants = fs.constants;
const access = promisify(fs.access);

const themeResponder = async (req, res) => {
    const themeConfig = getConfig('theme');
    await responder(req, res, themeConfig, req.app.mountpath !== '/');
};

const responder = async (req, res, themeConfig, admin) => {
    const themePath = getThemePath(themeConfig, admin);
    const filename = await getFileName(themeConfig[admin ? 'private' : 'public'], themePath, req.path, res.locals.themePage);
    renderTemplate(join(themePath, filename), res.locals)
        .then(html => res.send(html))
        .catch((error) => {
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
            renderFile(filePath, locals, (err, html) => {
                if (err) {
                    return reject(err);
                }
                return resolve(html);
            })
        });
    };

    let ejsRender = await myRender(
        filePath,
        locals,
    );

    // If the post, page or product has EJS rendering in it, render again so that also has renders done
    if (ejsRender.indexOf('<%') > -1 && ejsRender.indexOf('%>') > -1) {
        //TODO: This should work, but not 100% sure
        ejsRender = render(
            ejsRender,
            locals,
            {
                filename: filePath,
                cache: false
            }
        );
    }

    const hbsTemplate = handlebars.compile(ejsRender);
    return hbsTemplate(locals);
};


const getFileName = async (themeTypeConfig, themePath, path, themePage) => {
    let checkFilenames = [];

    if (themeTypeConfig.isApp) {
        // SPA's work from 1 index.html file
        checkFilenames.push('index.ejs');
        checkFilenames.push('index.html');
    } else {
        if (themePage) {
            checkFilenames.push(`${themePage}.ejs`);
            checkFilenames.push(`/pages/${themePage}.ejs`);
            checkFilenames.push(`${themePage}.html`);
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

    logger.error(`None of paths "${checkFilenames.join(', ')}" exist`);

    return themePage === 404 ? 'ERROR' : getFileName(themeTypeConfig, themePath, path, 404);
};

module.exports = {
    themeResponder
};
