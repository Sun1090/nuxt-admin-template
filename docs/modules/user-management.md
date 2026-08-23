---
outline: deep
---

# User Management

Full CRUD management for system users, including status control, password reset (single & batch), search, and pagination.

## Features

- **Create / Edit** — Add new users or modify existing ones via modal dialog
- **Status Control** — Toggle between `active`, `inactive`, and `suspended`
- **Password Reset** — Reset individual user password or batch reset selected users
- **Search** — Filter by username, name, email, phone, role, and status
- **Pagination** — Configurable page size with server-side pagination
- **Batch Operations** — Select multiple users for batch status change or password reset

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/systems/users/page` | Paginated user list with filters |
| GET | `/api/systems/users/[id]` | Get single user details |
| POST | `/api/systems/users` | Create new user |
| PUT | `/api/systems/users/[id]` | Update user |
| DELETE | `/api/systems/users/[id]` | Delete user |
| PUT | `/api/systems/users/[id]/status` | Change user status |
| POST | `/api/systems/users/[id]/reset-password` | Reset single user password |
| POST | `/api/systems/users/batch-status` | Batch status change |
| POST | `/api/systems/users/batch-reset-password` | Batch password reset |

### Paginated List Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `pageSize` | number | Items per page (default: 20) |
| `search` | string | Search keyword |
| `status` | string | Filter by status |
| `roleId` | string | Filter by role |
| `sortField` | string | Sort field |
| `sortOrder` | 'asc' \| 'desc' | Sort direction |

## Database Schema

```typescript
const users = pgTable('User', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  name: text('name'),
  email: text('email'),
  phone: text('phone'),
  avatar: text('avatar'),
  role_id: uuid('role_id').references(() => roles.id),
  last_login: timestamp('last_login'),
  lastLoginIp: text('lastLoginIp'),
  status: statusEnum('status').default('active').notNull(),
  forcePasswordChange: boolean('forcePasswordChange').default(true).notNull(),
  passwordChangedAt: timestamp('passwordChangedAt'),
  statusChangedAt: timestamp('statusChangedAt'),
  statusChangedBy: integer('statusChangedBy'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})
```

## Permissions

| Permission | Effect |
|------------|--------|
| `page:users` | Access the user management page |
| `menu:user_mgmt` | Show the users menu item |
| `action:user.create` | Allow creating users |
| `action:user.edit` | Allow editing users |
| `action:user.delete` | Allow deleting users |
| `action:user.status` | Allow changing user status |
| `action:user.resetPassword` | Allow resetting passwords |

## Related Components

- `app/pages/systems/users/index.vue` — Main page
- `app/pages/systems/users/modules/ListTable.vue` — Data table
- `app/pages/systems/users/modules/ListSearch.vue` — Search & filter bar
- `app/pages/systems/users/modules/AddDialog.vue` — Create/edit dialog
- `app/pages/systems/users/modules/DeleteDialog.vue` — Delete confirmation
- `app/pages/systems/users/modules/ResetDialog.vue` — Password reset dialog

## Type Definitions

See `app/types/api/systems/user.d.ts`.
