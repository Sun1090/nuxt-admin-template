---
outline: deep
---

# Permission Management

Manage all permissions in the system, organized into four categories: page, menu, action, and feature.

## Permission Categories

| Category | Prefix | Purpose | Example |
|----------|--------|---------|---------|
| Page | `page:` | Control page access | `page:users` |
| Menu | `menu:` | Show/hide sidebar items | `menu:user_mgmt` |
| Action | `action:` | Control operation buttons | `action:user.create` |
| Feature | `feature:` | Toggle feature switches | `feature:admin_access` |

## Features

- **CRUD Operations** — Create, edit, delete permissions
- **Category Filtering** — Filter by permission category
- **Search** — Search by name or resource

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/systems/permissions/page` | Paginated permission list with filters |
| GET | `/api/systems/permissions` | All permissions |
| POST | `/api/systems/permissions` | Create permission |
| PUT | `/api/systems/permissions/[id]` | Update permission |
| DELETE | `/api/systems/permissions/[id]` | Delete permission |

## Database Schema

```typescript
const permissions = pgTable('Permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  remark: varchar('remark'),
  category: varchar('category', { length: 20 }),
  resource: varchar('resource', { length: 50 }),
  action: varchar('action', { length: 20 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})
```

## Permission Check Chain

1. **Server middleware** — Queries real-time permissions, injects into `event.context.user.permissions`
2. **API endpoints** — Check via `user.permissions.includes('action:xxx')`
3. **Frontend route** — `page-auth.ts` middleware checks page-level permission
4. **Frontend components** — `usePermissions().canPerformAction(resource, action)` or `canAccessPage(pageName)`

## Related Components

- `app/pages/systems/permissions/index.vue` — Main page
- `app/pages/systems/permissions/modules/ListTable.vue` — Data table
- `app/pages/systems/permissions/modules/ListSearch.vue` — Search & filter bar
- `app/pages/systems/permissions/modules/AddDialog.vue` — Create/edit dialog
- `app/pages/systems/permissions/modules/DeleteDialog.vue` — Delete confirmation

## Type Definitions

See `app/types/api/systems/permission.d.ts`.
