import { resolve } from 'node:path'

console.log('>>> NUXT CONFIG LOADED from', import.meta.url)

export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: 'src/',
  ssr: false,
  compatibilityDate: '2025-11-03',
  modules: ['@pinia/nuxt', '@nuxtjs/i18n', 'nuxt-auth-utils'],

  routeRules: {},

  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.min.css'
  ],

  plugins: [
    '~/plugins/vuetify',
    { src: '~/plugins/motion.client', mode: 'client' },
  ],

  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET,
    authUrl: process.env.AUTH_URL
  },

  serverDir: resolve('src/server'),
  nitro: {
    scanDirs: [resolve('src/server')],
    storage: {
      uploads: { driver: 'fs', base: resolve('./uploads') }
    }
  },

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
  },

  typescript: {
    strict: true,
    typeCheck: true
  },
})