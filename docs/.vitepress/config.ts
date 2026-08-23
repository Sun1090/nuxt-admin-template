import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Nuxt Admin Template',
  description: 'A production-ready admin panel template built with Nuxt 4',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Sun1090/labor-dispatch-admin' },
    ],

    search: {
      provider: 'local',
    },

    i18nRouting: true,
  },

  locales: {
    'root': {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/introduction' },
          { text: 'API Reference', link: '/guide/api-reference' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'Changelog', link: '/changelog' },
        ],
        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Introduction', link: '/guide/introduction' },
              { text: 'Getting Started', link: '/guide/getting-started' },
              { text: 'Deployment', link: '/guide/deployment' },
              { text: 'Contributing', link: '/guide/contributing' },
              { text: 'FAQ', link: '/guide/faq' },
              { text: 'API Reference', link: '/guide/api-reference' },
            ],
          },
          {
            text: 'Modules',
            items: [
              { text: 'Dashboard', link: '/modules/dashboard' },
              { text: 'User Management', link: '/modules/user-management' },
              { text: 'Role Management', link: '/modules/role-management' },
              { text: 'Permission Management', link: '/modules/permission-management' },
              { text: 'API Key Management', link: '/modules/api-keys' },
              { text: 'API Access Logs', link: '/modules/api-logs' },
              { text: 'Email Templates', link: '/modules/email-templates' },
              { text: 'User Status Logs', link: '/modules/user-status-logs' },
              { text: 'Database Management', link: '/modules/database' },
              { text: 'System Settings', link: '/modules/system-settings' },
              { text: 'Notifications', link: '/modules/notifications' },
              { text: 'Profile & Settings', link: '/modules/profile-settings' },
            ],
          },
          { text: 'Architecture', link: '/architecture' },
          { text: 'Changelog', link: '/changelog' },
        ],
        editLink: {
          pattern: 'https://github.com/Sun1090/labor-dispatch-admin/edit/main/template/docs/:path',
          text: 'Edit this page on GitHub',
        },
        footer: {
          message: 'Released under the MIT License.',
          copyright: `Copyright ${new Date().getFullYear()}`,
        },
      },
    },
    'zh-CN': {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh-CN/guide/introduction' },
          { text: 'API 参考', link: '/zh-CN/guide/api-reference' },
          { text: '架构', link: '/zh-CN/architecture' },
          { text: '更新日志', link: '/zh-CN/changelog' },
        ],
        sidebar: [
          {
            text: '指南',
            items: [
              { text: '介绍', link: '/zh-CN/guide/introduction' },
              { text: '快速上手', link: '/zh-CN/guide/getting-started' },
              { text: '生产部署', link: '/zh-CN/guide/deployment' },
              { text: '贡献指南', link: '/zh-CN/guide/contributing' },
              { text: '常见问题', link: '/zh-CN/guide/faq' },
              { text: 'API 参考', link: '/zh-CN/guide/api-reference' },
            ],
          },
          {
            text: '模块说明',
            items: [
              { text: '仪表盘', link: '/zh-CN/modules/dashboard' },
              { text: '用户管理', link: '/zh-CN/modules/user-management' },
              { text: '角色管理', link: '/zh-CN/modules/role-management' },
              { text: '权限管理', link: '/zh-CN/modules/permission-management' },
              { text: 'API 密钥管理', link: '/zh-CN/modules/api-keys' },
              { text: 'API 访问日志', link: '/zh-CN/modules/api-logs' },
              { text: '邮件模板', link: '/zh-CN/modules/email-templates' },
              { text: '用户状态日志', link: '/zh-CN/modules/user-status-logs' },
              { text: '数据库管理', link: '/zh-CN/modules/database' },
              { text: '系统设置', link: '/zh-CN/modules/system-settings' },
              { text: '通知管理', link: '/zh-CN/modules/notifications' },
              { text: '个人设置', link: '/zh-CN/modules/profile-settings' },
            ],
          },
          { text: '架构设计', link: '/zh-CN/architecture' },
          { text: '更新日志', link: '/zh-CN/changelog' },
        ],
        editLink: {
          pattern: 'https://github.com/Sun1090/labor-dispatch-admin/edit/main/template/docs/:path',
          text: '在 GitHub 上编辑此页',
        },
        footer: {
          message: '基于 MIT 许可发布。',
          copyright: `Copyright ${new Date().getFullYear()}`,
        },
      },
    },
  },
})
