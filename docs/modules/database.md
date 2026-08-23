---
outline: deep
---

# Database Management

Administer the PostgreSQL database directly from the UI — export backups, restore data, manage sequences, and reset the database.

## Features

- **Backup Export** — Export the entire database schema and data as a SQL file
- **Backup Restore** — Upload and restore from a previously exported backup
- **Sequence Reset** — Reset all table sequence counters to fix auto-increment issues
- **Full Database Reset** — Drop all tables and re-create from migrations (destructive!)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/backup/export` | Export database backup |
| POST | `/api/admin/backup/restore` | Restore from backup file |
| POST | `/api/admin/database/reset` | Full database reset |
| POST | `/api/admin/fix-sequence` | Reset all sequences |

## Database Schema

The database management tools operate on all tables defined in `app/drizzle/schema.ts`, including:

| Table | Description |
|-------|-------------|
| `Role` | Roles with RBAC permissions |
| `User` | System users with auth and status |
| `Permissions` | Permission entries (page/menu/action/feature) |
| `Role_Permissions` | Many-to-many role-permission associations |
| `SystemSettings` | Global system configuration |
| `Notification` | User notifications |
| `NotificationSettings` | Per-user notification preferences |
| `api_keys` | API keys for programmatic access |
| `api_key_permissions` | API key permission bindings |
| `api_logs` | API access audit logs |
| `user_status_logs` | User status change history |
| `EmailTemplate` | Email template library |

## Permissions

| Permission | Effect |
|------------|--------|
| `page:system_database_backup` | Access backup page |
| `page:system_database_manage` | Access database management page |
| `action:database.backup` | Allow creating backups |
| `action:database.restore` | Allow restoring backups |
| `action:database.reset` | Allow resetting database |

## Related Components

- `app/pages/systems/database/backup/index.vue` — Backup page
- `app/pages/systems/database/manage/index.vue` — Database management page

> **Warning**: Database reset is destructive. Always create a backup before resetting.
