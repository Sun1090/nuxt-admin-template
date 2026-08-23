---
outline: deep
---

# API Key Management

Manage API keys for programmatic access, with permission binding, usage tracking, and access logging.

## Features

- **Generate API Keys** — Create new keys with a name and optional description
- **Permission Binding** — Assign specific API permissions to each key
- **Key Prefix + Hash** — Keys are displayed once on creation (prefix shown in UI); full key hashed with SHA-256
- **Usage Tracking** — Track last used time and total usage count
- **Expiration** — Optional expiry date for keys
- **Enable / Disable** — Toggle key active status
- **Access Logs** — View API call logs for each key

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/systems/api-keys` | List all API keys |
| GET | `/api/systems/api-keys/[id]` | Get single key details |
| POST | `/api/systems/api-keys` | Create new API key |
| PUT | `/api/systems/api-keys/[id]` | Update key (name, status, expiry) |
| DELETE | `/api/systems/api-keys/[id]` | Delete API key |
| GET | `/api/systems/api-keys/logs` | Access logs for all keys |

## Database Schema

```typescript
const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  remark: text('remark'),
  keyHash: varchar('key_hash', { length: 255 }).notNull().unique(),
  keyPrefix: varchar('key_prefix', { length: 10 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdByUserId: integer('created_by_user_id').notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
```

## Key Format

Generated keys follow the format: `nt_xxxx_xxxx_xxxx`, where the prefix (`nt_`) is stored and the full key is hashed.

## Server-side Auth Middleware

API key authentication is handled by `server/middleware/api-auth.ts`, which:
1. Looks for `x-api-key` header
2. Hashes the provided key
3. Matches against stored `keyHash`
4. Checks `isActive` status and expiry
5. Increments `usageCount` and updates `lastUsedAt`
6. Logs the call to `api_logs`

## Permissions

| Permission | Effect |
|------------|--------|
| `page:api_keys` | Access the API keys page |
| `action:apikey.create` | Allow creating API keys |
| `action:apikey.edit` | Allow editing API keys |
| `action:apikey.delete` | Allow deleting API keys |

## Related Components

- `app/pages/systems/api-keys/index.vue` — Main page
- `app/pages/systems/api-keys/modules/ListTable.vue` — Data table
- `app/pages/systems/api-keys/modules/ListSearch.vue` — Search & filter bar
- `app/pages/systems/api-keys/modules/AddDialog.vue` — Create/edit dialog
- `app/pages/systems/api-keys/modules/DeleteDialog.vue` — Delete confirmation
- `app/pages/systems/api-keys/modules/ApiKeyDetailDialog.vue` — Key detail view
- `app/pages/systems/api-keys/modules/SuccessDialog.vue` — Post-creation key display

## Type Definitions

See `app/types/api/systems/api-keys.d.ts`.
