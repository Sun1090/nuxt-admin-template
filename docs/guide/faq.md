---
outline: deep
---

# FAQ

Frequently asked questions and troubleshooting tips.

## General

### How do I reset the admin password?

Run the admin creation script again:
```bash
pnpm run admin:create
```
This will prompt for username and password. If the user already exists, it updates the password.

### How do I add a new database table?

1. Add the table definition to `app/drizzle/schema.ts`
2. Run `pnpm run db:generate` to create migration files
3. Run `pnpm run db:migrate` to apply the migration

### How do I add a new permission?

Add an entry to `scripts/sql/init-system.sql` and re-run `pnpm run db:init`. Also add the permission to any relevant admin user role.

### How do I add a new page?

1. Create a `.vue` file in `app/pages/`
2. Add menu entry in `app/constants/menus.ts`
3. Add `page:xxx` permission to the init SQL
4. Register in `app/middleware/auth.global.ts` → `PAGE_PERMISSION_MAP`

## Authentication

### Login loops back to login page

This usually means the JWT cookie is not being set or validated:
- Check `JWT_SECRET` is correctly set in `.env`
- Ensure cookies are not being blocked by the browser
- Verify `SameSite=Lax` is not causing issues with cross-origin requests
- Check server logs for token verification errors

### "Force password change" keeps redirecting

New accounts have `forcePasswordChange = true`. Set a new password in Profile → Account settings.

## Database

### `db:push` fails with relation already exists

Run `pnpm run db:drop` first to clear all tables, then `db:push` again. For production, use migrations instead.

### Database migration conflicts

If two developers generated migrations from different schema states, you may see version conflicts. Resolve by:
1. Dropping all migration files (`app/drizzle/migrations/`)
2. Generating a fresh migration: `pnpm run db:generate`
3. Applying: `pnpm run db:migrate`

## TypeScript

### `vue-router/volar` module not found

This is a known Nuxt 4 issue. The `postinstall` script patches `.nuxt/tsconfig.json` to remove the problematic entries. If the issue persists:
```bash
pnpm run postinstall
```

### Type errors after pulling latest code

```bash
rm -rf .nuxt node_modules/.cache
pnpm run dev    # Regenerates .nuxt types
```

## Permissions

### User can see a page but not perform actions

Check that the user's role has the required `action:` permissions assigned. Super admins (`is_superadmin = true`) bypass all checks.

### Menu item is not showing

Ensure:
1. The menu is defined in `app/constants/menus.ts`
2. The corresponding `menu:xxx` permission is assigned to the user's role
3. The route file exists in `app/pages/`

## API Keys

### API key not working

- Check the key is active in the management page
- Verify the key has the required permissions assigned
- Ensure the key is not expired
- API key is sent via `x-api-key` header, not as a query parameter

### Lost the full API key after creation

API keys are only shown once during creation. A new key must be generated. The prefix shown in the UI is for identification only.

## Deployment

### 502 Bad Gateway

The Node.js process may not be running. Check with `pm2 status` or `systemctl status`.

### Session not persisting across restarts

Ensure `JWT_SECRET` is set in the environment and is the same across all instances/replicas.

## Other

### How do I change the site logo?

Go to System Settings and update the Site Logo URL field.

### Can I use MySQL instead of PostgreSQL?

Not currently. The schema uses PostgreSQL-specific features (uuid, jsonb, pgEnum). Migration to MySQL would require schema rewrites.

### Is Redis required?

No. Redis is optional for caching auth data. The system works fully without it.
