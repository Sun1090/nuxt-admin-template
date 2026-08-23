---
outline: deep
---

# API Reference

Complete API endpoint reference organized by module.

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Cookie |
| GET | `/api/auth/verify` | Verify auth status | Cookie |
| POST | `/api/auth/change-password` | Change password | Cookie |
| POST | `/api/auth/set-initial-password` | Set initial password | Cookie |

## Dashboard

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/dashboard/stats` | System dashboard stats | `page:dashboard` |

## Users

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/systems/users/page` | Paginated user list | `page:users` |
| GET | `/api/systems/users/[id]` | Get user details | `page:users` |
| POST | `/api/systems/users` | Create user | `action:user.create` |
| PUT | `/api/systems/users/[id]` | Update user | `action:user.edit` |
| DELETE | `/api/systems/users/[id]` | Delete user | `action:user.delete` |
| PUT | `/api/systems/users/[id]/status` | Change user status | `action:user.status` |
| POST | `/api/systems/users/[id]/reset-password` | Reset password | `action:user.resetPassword` |
| POST | `/api/systems/users/batch-status` | Batch status change | `action:user.status` |
| POST | `/api/systems/users/batch-reset-password` | Batch password reset | `action:user.resetPassword` |

## Roles

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/systems/roles` | All roles | `page:roles` |
| GET | `/api/systems/roles/page` | Paginated role list | `page:roles` |
| GET | `/api/systems/roles/[id]` | Get role | `page:roles` |
| POST | `/api/systems/roles` | Create role | `action:role.create` |
| PUT | `/api/systems/roles/[id]` | Update role | `action:role.edit` |
| DELETE | `/api/systems/roles/[id]` | Delete role | `action:role.delete` |
| GET | `/api/systems/roles/[id]/permissions` | Get role permissions | `page:roles` |
| PUT | `/api/systems/roles/[id]/permissions` | Update role permissions | `action:role.assignPermission` |

## Permissions

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/systems/permissions` | All permissions | `page:permissions` |
| GET | `/api/systems/permissions/page` | Paginated list | `page:permissions` |
| POST | `/api/systems/permissions` | Create permission | `action:permission.create` |
| PUT | `/api/systems/permissions/[id]` | Update permission | `action:permission.edit` |
| DELETE | `/api/systems/permissions/[id]` | Delete permission | `action:permission.delete` |

## API Keys

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/systems/api-keys` | List all keys | `page:api_keys` |
| GET | `/api/systems/api-keys/[id]` | Get key details | `page:api_keys` |
| POST | `/api/systems/api-keys` | Create key | `action:apikey.create` |
| PUT | `/api/systems/api-keys/[id]` | Update key | `action:apikey.edit` |
| DELETE | `/api/systems/api-keys/[id]` | Delete key | `action:apikey.delete` |
| GET | `/api/systems/api-keys/logs` | Access logs | `page:api_keys` |

## API Logs

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/systems/api-logs/page` | Paginated log list | `page:api_logs` |

## Email Templates

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/systems/email-templates` | List all templates | `page:email_templates` |
| GET | `/api/systems/email-templates/[id]` | Get template | `page:email_templates` |
| POST | `/api/systems/email-templates` | Create template | `action:emailtemplate.create` |
| PUT | `/api/systems/email-templates/[id]` | Update template | `action:emailtemplate.edit` |
| DELETE | `/api/systems/email-templates/[id]` | Delete template | `action:emailtemplate.delete` |

## Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Paginated notification list |
| GET | `/api/notifications/unread-count` | Unread count |
| PUT | `/api/notifications/[id]` | Mark read/unread |
| POST | `/api/notifications/read-all` | Mark all read |
| GET | `/api/notifications/settings` | Get notification settings |
| PUT | `/api/notifications/settings` | Update notification settings |

## Database Administration

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| POST | `/api/admin/backup/export` | Export database backup | `action:database.backup` |
| POST | `/api/admin/backup/restore` | Restore backup | `action:database.restore` |
| POST | `/api/admin/database/reset` | Full database reset | `action:database.reset` |
| POST | `/api/admin/fix-sequence` | Reset sequences | `action:database.backup` |

## System Settings

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/systems/settings` | Get system settings | `page:system_settings` |
| PUT | `/api/systems/settings` | Update settings | `action:settings.edit` |

## User Status Logs

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/systems/user-status-logs/page` | Paginated log list | `page:user_status_logs` |

## System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/status` | System health check |
| POST | `/api/system/reconnect` | Reconnect database |
| POST | `/api/systems/system/init` | Initialize system data |
| GET | `/api/site-config` | Public site configuration |
| GET | `/api/proxy/image` | Proxy external images |

## Common Query Parameters

For paginated endpoints (`/page`):

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `pageSize` | number | 20 | Items per page |
| `search` | string | — | Search keyword |
| `sortField` | string | `createdAt` | Sort column |
| `sortOrder` | string | `desc` | Sort direction |

## Common Response Format

```json
{
  "data": { ... },
  "message": "Success"
}
```

For paginated endpoints:

```json
{
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

## Error Response Format

```json
{
  "statusCode": 403,
  "message": "Permission denied",
  "data": null
}
```

Common status codes:
- `200` — Success
- `400` — Bad request / validation error
- `401` — Unauthorized (not logged in)
- `403` — Permission denied
- `404` — Resource not found
- `429` — Rate limited
- `500` — Internal server error
