const { join } = require('path');
const { getConfig } = require('@notores/core');
const { getThemePath } = require('./config');

function serveStatic(admin = false) {
	return (req, res, next) => {
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

function checkAdminPath(req, res, next) {
	if(req.originalUrl === '/n-admin'){
		return res.redirect('/n-admin/');
	}

	next();
}

module.exports = {
	serveStatic,
	checkAdminPath,
};
