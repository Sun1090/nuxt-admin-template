import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    css: {
      // 确保 devSourcemap 为 true
      devSourcemap: true,
      // 确保 PostCSS 配置中没有显式禁用 Sourcemap
      postcss: {},
    },
    // SSR配置
    ssr: {
      noExternal: process.env.NETLIFY ? ['drizzle-orm', 'postgres'] : (process.env.VERCEL ? [] : ['drizzle-orm', 'postgres']),
    },
  },

  components: [
    {
      path: '~/components',
      extensions: ['.vue'],
    },
  ],

  modules: [
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
  ],

  i18n: {
    lazy: true,
    langDir: 'locales',
    strategy: 'no_prefix',
    defaultLocale: 'zh-CN',
    locales: [
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
      { code: 'zh-CN', language: 'zh-CN', name: '中文', file: 'zh-CN.json' },
    ],
    detectBrowserLanguage: false,
    vueI18n: 'i18n.config.ts',
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "~/components/ui"
     */
    componentDir: '~/components/ui',
  },
  devServer: {
    host: '0.0.0.0',
  },
  // 配置运行时配置
  runtimeConfig: {
    // 服务器私有键（不会暴露到客户端）
    jwtSecret: import.meta.env.JWT_SECRET || 'your-secret-key',
    // Redis配置（可选）
    redisUrl: import.meta.env.REDIS_URL || '',
    // 公共键（会暴露到客户端）
    public: {
      apiBase: '/api',
      // siteTitle: import.meta.env.NUXT_PUBLIC_SITE_TITLE || '校园广播站点歌系统',
      // siteLogo: import.meta.env.NUXT_PUBLIC_SITE_LOGO || '',
      // siteDescription: import.meta.env.NUXT_PUBLIC_SITE_DESCRIPTION || '校园广播站点歌系统 - 让你的声音被听见',
    },
  },
  features: {
    inlineStyles: true,
  },
  // 服务器端配置
  nitro: {
    preset: process.env.VERCEL ? 'vercel' : (process.env.NITRO_PRESET || 'node-server'),
    // 增强错误处理和稳定性
    experimental: {
      wasm: true,
    },
    timing: true,
  },

  colorMode: {
    classSuffix: '',
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  // TypeScript配置
  typescript: {
    strict: true,
  },
  fonts: {
    defaults: {
      weights: [300, 400, 500, 600, 700, 800],
    },
  },

  routeRules: {
    // ========== 缓存/头信息规则 ==========
    // API 路由 - 无缓存
    '/api/**': {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Connection': 'keep-alive',
      },
    },

    // 仪表盘
    '/dashboard': {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    },

    // 系统管理 - 使用通配符覆盖所有子路由
    '/systems/**': {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    },

    // 认证页面
    '/login': {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    },

    // 静态资源 - 长期缓存
    '/_nuxt/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
    '/assets/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
    '/favicon.ico': {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    },
    '/**/*.{png,jpg,jpeg,gif,webp,svg,ico}': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
    '/**/*.{css,js}': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },

    // ========== 重定向规则 ==========
    // 根路径和通用重定向
    '/': { redirect: '/dashboard' },
    '/admin': { redirect: '/dashboard' },
    '/management': { redirect: '/dashboard' },

    // 设置页面重定向
    '/settings': { redirect: '/settings/profile' },

    // 数据库管理重定向
    '/database': { redirect: '/systems/database/backup' },
    '/databases': { redirect: '/systems/database/backup' },

    // 通知重定向
    '/notification': { redirect: '/systems/notifications' },

    // 系统管理重定向
    '/system': { redirect: '/systems/users' },
    '/systems': { redirect: '/systems/users' },
    '/user': { redirect: '/systems/users' },
    '/users': { redirect: '/systems/users' },
    '/role': { redirect: '/systems/roles' },
    '/roles': { redirect: '/systems/roles' },
    '/permission': { redirect: '/systems/permissions' },
    '/permissions': { redirect: '/systems/permissions' },
    '/api-key': { redirect: '/systems/api-keys' },
    '/api-keys': { redirect: '/systems/api-keys' },
    // 组件页面重定向
    '/components': { redirect: '/components/accordion' },
  },
  // 自动导入
  imports: {
    dirs: [
      './lib',
      './composables',
    ],
  },

  compatibilityDate: '2024-12-14',
})
