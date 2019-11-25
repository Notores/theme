import {join} from "path";

export const getThemePath = (themeConfig: any, admin: boolean = false): string => {
    const config = admin ? themeConfig.private : themeConfig.public;
    let path = '';
    if (config.absolutePath) {
        if (config.absolutePath.indexOf(':root') === 0) {
            path = join(process.cwd(), path.replace(':root', ''));
        } else {
            path = config.absolutePath;
        }
    } else {
        path = join(process.cwd(), './public', './themes', admin ? `/${themeConfig.private.name}` || '/notores' : `/${themeConfig.public.name}` || '/notores', admin ? '/private' : '/public');
    }
    return path;
};
