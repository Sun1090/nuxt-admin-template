---
outline: deep
---

# User Status Logs

Track the history of user status changes — when a user was activated, deactivated, or suspended, and by whom.

## Features

- **Status Change History** — View all status changes for each user
- **Filtering** — Filter by user ID, old/new status, and date range
- **Audit Trail** — Shows which operator performed each change

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/systems/user-status-logs/page` | Paginated log list with filters |

### Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `pageSize` | number | Items per page |
| `userId` | number | Filter by user ID |
| `status` | string | Filter by new status |
| `startDate` | string | Start date filter |
| `endDate` | string | End date filter |

## Database Schema

```typescript
const userStatusLogs = pgTable('user_status_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  oldStatus: statusEnum('old_status'),
  newStatus: statusEnum('new_status').notNull(),
  reason: text('reason'),
  operatorId: integer('operator_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

## Permissions

| Permission | Effect |
|------------|--------|
| `page:user_status_logs` | Access the user status logs page |

## Related Components

- `app/pages/systems/user-status-logs/index.vue` — Main page

## Type Definitions

See `app/types/api/systems/user-status-logs.d.ts`.
