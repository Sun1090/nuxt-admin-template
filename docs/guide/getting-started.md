# Getting Started

Follow these steps to set up and run Nuxt Admin Template.

## Prerequisites

| Tool         | Version       | Notes                                    |
|--------------|---------------|------------------------------------------|
| Node.js      | >= 20.x       | LTS recommended                          |
| pnpm         | >= 11.x       | Comes with Node.js                        |
| PostgreSQL   | >= 14         | Or managed services like Neon, Supabase   |
| Redis        | >= 6 (opt.)   | For caching — the app works without it    |

## Step 1: Copy the Template

```bash
cp -r template/ my-admin-project
cd my-admin-project
```

Or clone from a repository:

```bash
git clone <repo-url> my-admin-project
cd my-admin-project
```

## Step 2: Install Dependencies

```bash
pnpm install
```

The `postinstall` script automatically runs `nuxt prepare` and patches `.nuxt/tsconfig.json` for `vue-router` compatibility.

## Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your own values:

```txt
# Database (required)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nuxt_admin

# JWT secret (required) — generate with: openssl rand -base64 32
JWT_SECRET=your-random-secret-key

# Redis (optional)
# REDIS_URL=redis://localhost:6379
```

## Step 4: Create the Database

```sql
CREATE DATABASE nuxt_admin;
```

## Step 5: Push Schema

```bash
pnpm run db:push
```

Creates all tables from the Drizzle schema. For production, use `db:generate` + `db:migrate`.

## Step 6: Initialize System Data

```bash
pnpm run db:init
```

Seeds default roles (Super Admin, System Admin, Normal User) and all permissions.

## Step 7: Create Admin Account

```bash
pnpm run admin:create
```

Output:

```
Username: admin
Password: admin123
Role: Super Admin
```

## Step 8: Start Dev Server

```bash
pnpm run dev
```

Open `http://localhost:3000` and log in with `admin / admin123`.

## What You Should See

- **Dashboard** with system stats and recent users
- **Sidebar** with all management modules
- **Settings** for profile, password, appearance, notifications

## Common Workflows

### Creating a New Page

1. Add a `.vue` file under `app/pages/`
2. Register menu in `app/constants/menus.ts`
3. Add permission to `scripts/sql/init-system.sql` and re-run `db:init`
4. Register page in `app/middleware/auth.global.ts` → `PAGE_PERMISSION_MAP`

### Creating a New API

1. Add file under `server/api/` (e.g. `server/api/systems/items/index.get.ts`)
2. Check permissions:
   ```ts
   const user = event.context.user
   if (!user?.permissions?.includes('action:item.read')) {
     throw createError({ statusCode: 403 })
   }
   ```

### Adding a New Database Table

1. Define table and relations in `app/drizzle/schema.ts`
2. Run `pnpm run db:generate` + `pnpm run db:migrate`
3. Export type if needed

## Production Deployment

```bash
pnpm run build
NODE_ENV=production node .output/server/index.mjs
```

### Checklist

- [ ] `DATABASE_URL` and `JWT_SECRET` configured
- [ ] `JWT_SECRET` is a strong random string
- [ ] `NODE_ENV=production` set
- [ ] Migrations applied (not `db:push`)
- [ ] System data initialized
- [ ] Admin password changed from default

## Troubleshooting

| Issue                              | Solution                                                   |
|------------------------------------|------------------------------------------------------------|
| Database connection fails          | Check `DATABASE_URL` and PostgreSQL status                  |
| Login loops back to login          | Verify `JWT_SECRET`; check cookies aren't blocked           |
| Permission denied                  | Assign permissions to role; superadmin needs `is_superadmin` |
| `db:push` errors                   | Verify database exists and connection is correct            |
| Typecheck errors                   | Run `pnpm run dev` first to generate `.nuxt` types           |
| `vue-router/volar` module missing  | Auto-patched in `postinstall`; re-run `pnpm install`         |

## Command Reference

| Command                 | Purpose                                  |
|-------------------------|------------------------------------------|
| `pnpm run dev`           | Start dev server                         |
| `pnpm run build`         | Build for production                     |
| `pnpm run preview`       | Preview production build                 |
| `pnpm run db:generate`   | Generate migration files                 |
| `pnpm run db:migrate`    | Run migrations                           |
| `pnpm run db:push`       | Push schema directly (dev only)          |
| `pnpm run db:studio`     | Open Drizzle Studio                      |
| `pnpm run db:init`       | Seed default roles and permissions       |
| `pnpm run admin:create`  | Create admin account                     |
| `pnpm run lint`          | Run ESLint                               |
| `pnpm run typecheck`     | TypeScript type checking                 |
