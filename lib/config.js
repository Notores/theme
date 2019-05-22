const getThemePath = (themeConfig, admin = false) => {
	return join(process.cwd(), './public', './themes', admin ? `/${themeConfig.private.name}` || '/notores' : `/${themeConfig.public.name}` || '/notores', admin ? '/private' : '/public');
};

module.exports = {
	getThemePath,
};
