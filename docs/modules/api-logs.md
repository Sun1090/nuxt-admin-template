---
outline: deep
---

# API Access Logs

Monitor and audit API calls made using API keys. Provides detailed logs of each request including endpoint, method, status, and response time.

## Features

- **Log Listing** — Paginated list of all API access logs
- **Filtering** — Filter by endpoint path, HTTP method, status code, and date range
- **Detail View** — View full request and response bodies for debugging
- **Export** — Download logs as CSV or Excel for external analysis

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/systems/api-logs/page` | Paginated log list with filters |

### Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `pageSize` | number | Items per page |
| `endpoint` | string | Filter by endpoint path |
| `method` | string | Filter by HTTP method |
| `statusCode` | number | Filter by status code |
| `startDate` | string | Start date filter |
| `endDate` | string | End date filter |
| `apiKeyId` | string | Filter by API key |

## Database Schema

```typescript
const apiLogs = pgTable('api_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  apiKeyId: uuid('api_key_id'),
  endpoint: varchar('endpoint', { length: 500 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent'),
  statusCode: integer('status_code').notNull(),
  responseTimeMs: integer('response_time_ms').notNull(),
  requestBody: text('request_body'),
  responseBody: text('response_body'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  errorMessage: text('error_message'),
})
```

## Permissions

| Permission | Effect |
|------------|--------|
| `page:api_logs` | Access the API logs page |
| `action:apilog.export` | Allow exporting logs |

## Related Components

- `app/pages/systems/api-logs/index.vue` — Main page

## Type Definitions

See `app/types/api/systems/api-logs.d.ts`.
