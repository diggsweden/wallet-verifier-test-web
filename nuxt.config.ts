// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    devtools: {enabled: true},
    devServer: {port: 3000},
    typescript: {
        typeCheck: true
    },
    nitro: {
        devProxy: {
            '^/(utilities|ui|wallet)': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },
    runtimeConfig: {
        public: {
            hostApi: process.env.HOST_API || 'http://localhost:8080',
        },
    },
})
