// SPDX-FileCopyrightText: 2025 The Wallet Test Verifier Web Authors
//
// SPDX-License-Identifier: EUPL-1.2

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  devServer: { port: 3002 },
  modules: ["@nuxtjs/tailwindcss", "nuxt-qrcode"],
  vite: {
    esbuild: {
      drop:
        process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
    },
  },
  typescript: {
    typeCheck: false,
  },
  runtimeConfig: {
    public: {
      hostApi: process.env.HOST_API || "http://eudi-verifier",
      walletUrl: process.env.WALLET_URL || "openid4vp://",
    },
  },
  qrcode: {
    options: {
      variant: {
        inner: "circle",
        marker: "rounded",
        pixel: "rounded",
      },
      radius: 1,
      blackColor: "currentColor",
      whiteColor: "white",
    },
  },
  nitro: {
    port: 3002,
    host: "0.0.0.0",
    devProxy: {
      "/ui/": {
        target: "https://eudi-verifier-backend.wallet.local/ui/",
        changeOrigin: true,
      },
      "/wallet/": {
        target: "https://eudi-verifier-backend.wallet.local/wallet/",
        changeOrigin: true,
      },
    },
  },
});
