---
outline: deep
---

# Email Templates

Manage HTML email templates used by the system for notifications and system emails.

## Features

- **CRUD Operations** — Create, edit, delete email templates
- **Rich HTML Editor** — Edit template HTML in a textarea
- **Template Variables** — Support for dynamic variables in templates
- **Key-based Identification** — Each template has a unique key for programmatic reference

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/systems/email-templates` | List all templates |
| GET | `/api/systems/email-templates/[id]` | Get single template |
| POST | `/api/systems/email-templates` | Create template |
| PUT | `/api/systems/email-templates/[id]` | Update template |
| DELETE | `/api/systems/email-templates/[id]` | Delete template |

## Database Schema

```typescript
const emailTemplates = pgTable('EmailTemplate', {
  id: serial('id').primaryKey(),
  key: varchar('key').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  subject: varchar('subject', { length: 300 }).notNull(),
  html: text('html').notNull(),
  updatedByUserId: integer('updatedByUserId'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})
```

## Permissions

| Permission | Effect |
|------------|--------|
| `page:email_templates` | Access the email templates page |
| `action:emailtemplate.create` | Allow creating templates |
| `action:emailtemplate.edit` | Allow editing templates |
| `action:emailtemplate.delete` | Allow deleting templates |

## Related Components

- `app/pages/systems/email-templates/index.vue` — Main page
- `app/pages/systems/email-templates/modules/ListTable.vue` — Data table
- `app/pages/systems/email-templates/modules/AddDialog.vue` — Create/edit dialog
- `app/pages/systems/email-templates/modules/DeleteDialog.vue` — Delete confirmation

## Type Definitions

See `app/types/api/systems/email-template.d.ts`.
