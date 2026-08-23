---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Nuxt Admin Template"
  text: "Production-Ready Admin Panel"
  tagline: Built with Nuxt 4 · Vue 3 · shadcn-vue · TailwindCSS 4 · Drizzle ORM
  image:
    src: /logo.svg
    alt: Nuxt Admin Template
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/your-org/nuxt-admin-template

features:
  - title: RBAC Permission System
    details: Four-tier permission system — page, menu, action, feature — with role-based assignment and superadmin override.
  - title: Full System Modules
    details: User, role, permission, API key, email template, database management — all with CRUD, search, and batch operations.
  - title: Type-Safe ORM
    details: Drizzle ORM with full TypeScript inference from schema to query results. PostgreSQL with optional Redis caching.
  - title: Modern UI Stack
    details: shadcn-vue components, TailwindCSS 4 styling, dark mode, responsive layout, and accessible widgets.
  - title: JWT Authentication
    details: Secure HttpOnly cookies, bcrypt hashing, IP rate limiting, account lockout, and forced password change.
  - title: Production Ready
    details: Nuxt 4 SSR/SSG, ESLint + TypeScript strict, documented CLI scripts, and Vercel deployment support.
---
