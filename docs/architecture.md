---
outline: deep
---

# Architecture

This document describes the overall architecture, directory structure, and key design decisions of Nuxt Admin Template.

## Directory Structure

```
nuxt-admin-template/
├── app/                        # Frontend application
│   ├── assets/css/             # Global styles
│   ├── components/             # Vue components
│   │   ├── layout/             # Layout (Header, Sidebar, etc.)
│   │   ├── dashboard/          # Dashboard widgets
│   │   ├── settings/           # Settings forms
│   │   └── ui/                 # shadcn-vue UI components
│   ├── composables/            # Vue composables
│   ├── constants/              # Constants & menu config
│   ├── drizzle/                # Drizzle ORM schema & migrations
│   ├── middleware/             # Route guards
│   ├── pages/                  # File-based page routes
│   ├── plugins/                # Nuxt plugins
│   ├── types/                  # TypeScript definitions
│   └── utils/                  # Frontend utilities
├── server/                     # Backend
│   ├── api/                    # REST API endpoints
│   ├── middleware/             # Server middleware
│   ├── services/               # Business logic
│   └── utils/                  # Server utilities
├── scripts/                    # CLI tools
├── i18n/                       # Internationalization (locales, config)
├── public/                     # Static assets (logo, favicon)
└── docs/                       # VitePress documentation
```

## Authentication Flow

```
User Login
  │
  ├─ POST /api/auth/login
  │    ├─ Validate credentials
  │    ├─ Check IP/account lockout
  │    ├─ Generate JWT token
  │    └─ Set HttpOnly Cookie (auth-token)
  │
  ├─ Subsequent requests carry Cookie
  │    └─ server/middleware/auth.ts
  │         ├─ Extract token from Cookie
  │         ├─ Verify JWT
  │         ├─ Query user info + role
  │         ├─ Load permissions
  │         ├─ Inject event.context.user
  │         └─ API-level permission check
  │
  └─ Frontend route guard
       └─ app/middleware/auth.global.ts
            ├─ Not logged in → redirect to /login
            └─ Page permission → redirect to /403
```

## Permission System

### Permission Categories

| Category | Prefix   | Purpose                    | Example                   |
|----------|----------|----------------------------|---------------------------|
| Page     | `page:`  | Control page access        | `page:users`, `page:roles` |
| Menu     | `menu:`  | Show/hide sidebar items    | `menu:user_mgmt`          |
| Action   | `action:` | Control operation buttons  | `action:user.create`      |
| Feature  | `feature:` | Toggle feature switches   | `feature:admin_access`    |

### Permission Check Chain

1. **Login** → JWT cookie set (permissions not stored in token)
2. **Server middleware** → Query real-time permissions, inject into `event.context.user.permissions`
3. **API endpoints** → Check `event.context.user.permissions.includes('action:xxx')`
4. **Frontend route** → Middleware checks page-level permission
5. **Frontend components** → `usePermissions().canPerformAction(resource, action)`

### Super Admin

Roles with `is_superadmin = true` automatically have all permissions.

## Database Design

### Core Table Relationships

```
Role ──┬──< User >──┬──< Notification
       │             ├──< NotificationSettings
       │             ├──< UserStatusLog
       │             └──< ApiKey >──┬──< ApiKeyPermission
       │                            └──< ApiLog
       └──< Role_Permissions >── Permissions
```

### Drizzle ORM

- Schema: `app/drizzle/schema.ts`
- Connection: `app/drizzle/db.ts` (supports Neon and local PostgreSQL)
- Migrations: `app/drizzle/migrations/`
- Dev: `db:push` for fast sync; Production: `db:migrate`

## Caching Strategy

Redis is optional:
- With `REDIS_URL`: auth info cached, reducing DB queries
- Without Redis: system works, fetches user info each request
- Cache key: `auth:user:{userId}` — cleared on password/status change

## Security

| Mechanism              | Description                              |
|------------------------|------------------------------------------|
| JWT + HttpOnly Cookie | Token not exposed to JS, XSS protection  |
| IP rate limiting      | Lock IP after repeated login failures     |
| Account lockout       | Lock account after repeated failures      |
| Password hashing      | bcrypt, 12 rounds                        |
| Force password change | New users must change password on login  |
| CSRF                  | SameSite=Lax cookie policy               |
| API Key auth          | SHA-256 hashed keys for Open API access  |
