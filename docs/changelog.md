---
outline: deep
---

# Changelog

## 1.0.0 (2026-07-19)

Initial release of Nuxt Admin Template.

### Features

- **Dashboard**: Stats overview, recent users, quick actions
- **User Management**: Full CRUD, status switch, batch password/status reset, search & pagination
- **Role Management**: CRUD, permission assignment, member overview
- **Permission Management**: Categorized (page/menu/action/feature), CRUD
- **API Key Management**: Key generation, permission binding, usage tracking, access logs
- **API Access Logs**: Filter by endpoint/method/status, pagination
- **Email Templates**: CRUD with template editing
- **User Status Logs**: Account status change history
- **Database Management**: Backup export/restore, sequence reset, full reset
- **System Settings**: Site title, logo, description, ICP, login bg, registration controls
- **Profile & Settings**: Personal info, password change, appearance, notifications

### Technical

- Nuxt 4 + Vue 3 + TypeScript
- shadcn-vue + TailwindCSS 4
- Drizzle ORM with PostgreSQL
- RBAC permission system (page/menu/action/feature)
- JWT auth with HttpOnly cookies
- Dark mode support
- Responsive sidebar layout
- Internationalized documentation (English + Chinese)
