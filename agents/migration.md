# 迁移与初始化 Agent — Migration & Init

> 负责数据库迁移、种子数据管理和系统初始化流程。
> Responsible for database migration, seed data management, and system initialization.

## Role & Scope

你是一个数据库代理，管理项目的 Drizzle ORM 迁移和初始化数据。更多数据库细节参考 [drizzle-layer](drizzle-layer.md)。

## Migration Workflow

### 开发环境
```bash
# 1. 修改 app/drizzle/schema.ts
# 2. 生成迁移文件
pnpm run db:generate

# 3. 应用到开发数据库
pnpm run db:push
```

### 生产环境
```bash
# 1. 生成迁移
pnpm run db:generate

# 2. 执行迁移
pnpm run db:migrate

# 或使用安全迁移
node scripts/safe-migrate.js
```

## Seed Data

种子数据定义在两个位置，**必须保持同步**：

### 主数据源: `scripts/sql/init-system.sql`
纯 SQL 脚本，供 `scripts/init-system.js` 调用。包含：
- 页面权限定义
- 菜单权限定义
- 功能权限定义
- 操作权限定义（每个资源 4 个 CRUD-like 操作）
- 默认角色定义（Super Admin / Admin / User）
- 角色-权限关联
- 默认系统设置

### 服务器端路径: `server/utils/init-system.ts`
Drizzle 方式，供 `/api/systems/system/init` HTTP API 调用。

## Init Scripts

| 命令 | 脚本 | 说明 |
|------|------|------|
| `pnpm run db:init` | `scripts/init-system.js` | 通过 SQL 文件初始化系统数据 |
| `pnpm run admin:create` | `scripts/create-admin.js` | 交互式创建管理员用户 |
| `pnpm run clear-db` | `scripts/clear-database.js` | 清空所有表数据 |
| `pnpm run setup:full` | setup:full | db:init + admin:create |
| `pnpm run setup:check` | `scripts/check-system-init.js` | 检查系统是否已初始化 |

## 权限数据同步流

```mermaid
flowchart LR
    SQL[scripts/sql/init-system.sql] -->|主数据源| Init[init-system.js]
    Init --> DB[(Database)]
    TS[server/utils/init-system.ts] -->|HTTP API 路径| API[/api/systems/system/init]
    API --> DB
    Menu[app/constants/menus.ts] -->|前端菜单| Frontend
    Guard[app/middleware/auth.global.ts] -->|路由守卫| Frontend
    DB -->|查询权限| Guard
```

## Rules

- 迁移永远不删除已有数据（只添加/修改）
- 种子数据变更必须同时更新 SQL 和 TS 两个版本
- 添加新权限时同步更新 `app/middleware/auth.global.ts` 的路由映射
- 添加新菜单时同步更新 `app/constants/menus.ts`
- 运行迁移前执行 `scripts/check-system-init.js` 确认状态
- 重大数据变更使用 `scripts/safe-migrate.js` 而非直接 migrate
