---
outline: deep
---

# Dashboard

The Dashboard is the landing page after login, providing an at-a-glance overview of system status, recent activity, and quick actions.

## Stats Overview

Six stat cards display key metrics fetched from `GET /api/dashboard/stats`:

| Stat | Description |
|------|-------------|
| Total Users | Total registered user count |
| Total Roles | Number of roles in the system |
| Active API Keys | Count of active API keys |
| API Calls | Total API calls logged |
| Today's Logins | Unique logins in the current day |
| Active Sessions | Users active in the last 30 minutes |

Each card auto-loads on page mount and displays a loading skeleton while fetching. Stat values animate using `<NumberFlow>` (`@number-flow/vue`).

### API Endpoint

```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "totalUsers": 42,
  "totalRoles": 3,
  "activeApiKeys": 15,
  "apiCallsToday": 1284,
  "loginsToday": 8,
  "activeSessions": 3
}
```

## Recent Users

The `<dashboard/recent-users>` component lists recently registered users with avatar, name, email, role, and registration date.

## Quick Actions

Quick action buttons provide one-click access to common tasks:

- **Add User** → navigates to `/systems/users`
- **Create Role** → navigates to `/systems/roles`
- **System Settings** → navigates to `/systems/settings`
- **Email Templates** → navigates to `/systems/email-templates`

## Type Definitions

```typescript
namespace Api.Dashboard {
  interface Stats {
    totalUsers: number
    totalRoles: number
    activeApiKeys: number
    apiCallsToday: number
    loginsToday: number
    activeSessions: number
  }
}
```

## Related Components

- `app/components/dashboard/card-data.vue` — Stat card display
- `app/components/dashboard/header-banner.vue` — Welcome banner
- `app/components/dashboard/quick-actions.vue` — Action buttons
- `app/components/dashboard/recent-users.vue` — Recent user list
