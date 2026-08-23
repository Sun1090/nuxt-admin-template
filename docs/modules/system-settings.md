---
outline: deep
---

# System Settings

Configure global system parameters — branding, display, and registration controls — from a single settings page.

## Features

- **Site Identity** — Site title, description, logo URL
- **ICP Number** — Chinese ICP filing number for compliance
- **Login Background** — Custom login page background image URL
- **Registration Controls** — Toggle user self-registration and CAPTCHA
- **Default User Role** — Role assigned to newly self-registered users

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/systems/settings` | Get current system settings |
| PUT | `/api/systems/settings` | Update system settings |

## Database Schema

```typescript
const systemSettings = pgTable('SystemSettings', {
  id: serial('id').primaryKey(),
  siteTitle: text('siteTitle'),
  siteLogoUrl: text('siteLogoUrl'),
  siteDescription: text('siteDescription'),
  icpNumber: text('icpNumber'),
  loginBgUrl: text('loginBgUrl'),
  enableRegistration: boolean('enableRegistration').default(false).notNull(),
  enableCaptcha: boolean('enableCaptcha').default(false).notNull(),
  defaultUserRole: text('defaultUserRole'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})
```

## Permissions

| Permission | Effect |
|------------|--------|
| `page:system_settings` | Access the system settings page |
| `action:settings.edit` | Allow editing system settings |

## Related Components

- `app/pages/systems/settings/index.vue` — Main settings page

## Type Definitions

See `app/types/api/systems/settings.d.ts`.
