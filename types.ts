import '@notores/core';

export interface ThemeConfig {
    name: string,
    isApp: boolean
}

declare global {
    namespace Notores {
        interface INotoresConfig {
            theme: {
                public: ThemeConfig,
                private: ThemeConfig
            }
        }
    }
}
export interface Tag {
    path: boolean;
    script: string;
}
