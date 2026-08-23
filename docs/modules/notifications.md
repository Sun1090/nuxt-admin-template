---
outline: deep
---

# Notifications

In-app notification system for user-facing alerts and messages. Includes notification list, real-time unread count, and per-user settings.

## Features

- **Notification List** — Paginated list of all notifications for the current user
- **Filter Tabs** — Switch between all, unread, and read notifications
- **Mark as Read** — Mark individual notifications read, or mark all as read
- **Unread Count** — Header bell icon shows real-time unread count (polls every 60s)
- **Notification Settings** — Per-user toggle to enable/disable notifications

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Paginated notification list for current user |
| GET | `/api/notifications/unread-count` | Get unread notification count |
| PUT | `/api/notifications/[id]` | Mark single notification read/unread |
| POST | `/api/notifications/read-all` | Mark all notifications as read |
| GET | `/api/notifications/settings` | Get current user's notification settings |
| PUT | `/api/notifications/settings` | Update notification settings |

## Database Schema

```typescript
const notifications = pgTable('Notification', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  userId: integer('userId').notNull().references(() => users.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

const notificationSettings = pgTable('NotificationSettings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('userId').notNull().references(() => users.id).unique(),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})
```

## Permissions

| Permission | Effect |
|------------|--------|
| `page:notifications` | Access notification page |
| `menu:notifications` | Show notification menu item |

## Related Components

- `app/pages/systems/notifications/index.vue` — Main notification list page
- `app/components/layout/Header.vue` — Header bell icon with unread count

## Type Definitions

See `app/types/api/systems/notification.d.ts`.
