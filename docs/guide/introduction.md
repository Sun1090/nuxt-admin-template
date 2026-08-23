# Introduction

## What is Nuxt Admin Template?

**Nuxt Admin Template** is a full-featured, production-ready admin panel starter kit built on the modern Nuxt 4 + Vue 3 ecosystem. It delivers a complete backend management experience out of the box, covering user management, role-based access control (RBAC), API key governance, database administration, and system configuration.

## Tech Stack

| Category          | Technology                                    |
|-------------------|-----------------------------------------------|
| Framework         | Nuxt 4 (SSR/SSG), Vue 3                       |
| UI                | shadcn-vue, TailwindCSS 4, reka-ui            |
| Icons             | Lucide Vue, Radix Icons                       |
| ORM               | Drizzle ORM (PostgreSQL)                      |
| Auth              | JWT (HttpOnly Cookie) + bcrypt                |
| Cache             | Redis (optional)                              |
| Forms             | vee-validate + Zod                            |
| Tables            | @tanstack/vue-table                           |
| Charts            | ECharts, @unovis/vue                          |
| State             | Pinia                                         |
| Utilities         | VueUse, date-fns                              |
| Language          | TypeScript                                    |
| I18n              | @nuxtjs/i18n (vue-i18n), JSON locales         |
| Linting           | ESLint (antfu config)                         |
| Package Manager   | pnpm                                           |

## Feature Highlights

### Authentication & Security

- JWT-based login with HttpOnly cookies
- bcrypt password hashing (12 rounds)
- IP-based rate limiting and account lockout
- Force password change on first login
- CSRF protection via SameSite=Lax cookies

### RBAC Permission System

- Four permission categories: **page**, **menu**, **action**, **feature**
- Role-based permission assignment with superadmin override
- Both frontend (route guard + component-level) and backend (middleware) permission checks

### System Modules

| Module                 | Features                                                           |
|------------------------|--------------------------------------------------------------------|
| **Dashboard**          | Stats overview, recent users, quick actions                        |
| **User Management**    | CRUD, status switch, batch password/status ops, search & pagination |
| **Role Management**    | CRUD, permission assignment, member overview                       |
| **Permission Mgmt**    | Categorized (page/menu/action/feature), CRUD                        |
| **API Key Management** | Key generation, permission binding, usage stats, access logs       |
| **API Access Logs**    | Filter by endpoint/method/status, pagination                        |
| **Email Templates**    | CRUD with rich editor                                               |
| **User Status Logs**   | Status change history                                                |
| **Database Mgmt**      | Backup export/restore, sequence reset, full reset                    |
| **System Settings**    | Site title, logo, description, ICP, login bg, registration toggles |
| **Profile & Settings** | Personal info, password change, appearance & notification prefs     |

## Design Decisions

1. **File-based routing** — Nuxt's auto-routing keeps page organization intuitive.
2. **Server routes co-located** — API endpoints in `server/api/` mirror the page structure.
3. **Permission-first architecture** — Every API and page is permission-gated by default.
4. **Drizzle ORM for type safety** — Full TypeScript inference from schema to queries.
5. **Minimal dependencies** — Only essential libraries; no bloat.

## Project Structure

```
├── app/                      # Frontend
│   ├── components/           # Vue components
│   ├── composables/          # useAuth, usePermissions, usePagination, ...
│   ├── constants/            # Menu config, global constants
│   ├── drizzle/              # Schema, DB connection, migrations
│   ├── middleware/           # Route guards
│   ├── pages/                # File-based pages
│   ├── plugins/              # Nuxt plugins
│   ├── types/                # TypeScript definitions
│   └── utils/                # Helper functions
├── server/                   # Backend
│   ├── api/                  # REST endpoints
│   ├── middleware/            # JWT auth, API key auth
│   ├── services/              # Business logic
│   └── utils/                # Server utilities
├── scripts/                  # CLI tools
├── i18n/                     # Internationalization (locales, i18n config)
└── docs/                     # VitePress documentation
```
