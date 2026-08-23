---
outline: deep
---

# Role Management

Role-based access control (RBAC) management — create roles, assign permissions, and view members.

## Features

- **Create / Edit Roles** — Define roles with a name and description
- **Permission Assignment** — Assign page/menu/action/feature permissions to each role
- **Member Overview** — See which users are assigned to each role
- **Super Admin Flag** — Roles with `is_superadmin=true` bypass all permission checks

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/systems/roles/page` | Paginated role list |
| GET | `/api/systems/roles` | All roles (for dropdowns) |
| GET | `/api/systems/roles/[id]` | Get single role |
| POST | `/api/systems/roles` | Create role |
| PUT | `/api/systems/roles/[id]` | Update role |
| DELETE | `/api/systems/roles/[id]` | Delete role |
| GET | `/api/systems/roles/[id]/permissions` | Get role permissions |
| PUT | `/api/systems/roles/[id]/permissions` | Update role permissions |

## Database Schema

```typescript
const roles = pgTable('Role', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text('name').notNull(),
  remark: varchar('remark'),
  is_superadmin: boolean('is_superadmin').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})
```

## Permissions

| Permission | Effect |
|------------|--------|
| `page:roles` | Access the role management page |
| `menu:role_mgmt` | Show the roles menu item |
| `action:role.create` | Allow creating roles |
| `action:role.edit` | Allow editing roles |
| `action:role.delete` | Allow deleting roles |
| `action:role.assignPermission` | Allow assigning permissions to roles |

## Related Components

- `app/pages/systems/roles/index.vue` — Main page
- `app/pages/systems/roles/modules/ListTable.vue` — Data table
- `app/pages/systems/roles/modules/ListSearch.vue` — Search & filter bar
- `app/pages/systems/roles/modules/AddDialog.vue` — Create/edit dialog
- `app/pages/systems/roles/modules/DeleteDialog.vue` — Delete confirmation
- `app/pages/systems/roles/modules/ResetDialog.vue` — Permission assignment dialog

## Type Definitions

See `app/types/api/systems/role.d.ts`.
