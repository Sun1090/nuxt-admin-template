---
outline: deep
---

# Contributing

Guidelines for contributing to Nuxt Admin Template.

## Development Setup

```bash
git clone <repo-url>
cd template
pnpm install
cp .env.example .env
# Edit .env with your database credentials
pnpm run db:push
pnpm run db:init
pnpm run admin:create
pnpm run dev
```

## Project Structure

```
app/          # Frontend (Vue components, pages, composables)
server/       # Backend (API endpoints, middleware, services)
scripts/      # CLI utilities
docs/         # VitePress documentation
```

## Coding Standards

- **TypeScript** — Strict mode enabled. Use explicit types for all functions.
- **ESLint** — Uses `@antfu/eslint-config`. Run `pnpm run lint` before committing.
- **Naming Conventions**:
  - Vue files: `PascalCase.vue`
  - TypeScript files: `camelCase.ts`
  - API routes: `kebab-case` for URL paths

## Adding a New Feature

1. **Database**: Define tables in `app/drizzle/schema.ts`, run `db:generate` + `db:migrate`
2. **API**: Create endpoint files under `server/api/`
3. **Types**: Add type definitions in `app/types/api/`
4. **Page**: Create `.vue` file under `app/pages/`
5. **Components**: Extract reusable logic into `app/components/`
6. **Menu**: Register in `app/constants/menus.ts`
7. **Permissions**: Add permission entries to init SQL and Permission constants
8. **Middleware**: Register page/menu permissions in `app/middleware/auth.global.ts`
9. **Documentation**: Update docs with module details

## Pull Request Process

1. Create a feature branch from `main`
2. Make changes and run `pnpm run typecheck`
3. Run `pnpm run lint` to fix formatting
4. Update documentation if adding new features
5. Create a pull request with a clear description

## Commit Messages

Follow conventional commits format:

```
feat: add user batch password reset
fix: resolve pagination overflow on mobile
docs: add deployment guide
refactor: simplify auth middleware
chore: upgrade nuxt to 4.5.0
```

## TypeScript Guidelines

- Prefer interfaces over type aliases for object shapes
- Use `namespace Api.X` for API response types
- Export Drizzle types from schema.ts (`$inferSelect`, `$inferInsert`)
- Use `as const` for constant arrays and enums
- Avoid `any` — use `unknown` and type guards instead

## Testing

Tests are not yet implemented but contributions adding test infrastructure are welcome.
