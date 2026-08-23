# 数据库层 Agent — Drizzle Layer

> 负责 `app/drizzle/` 和数据库相关代码：Schema 定义、迁移管理、查询优化、种子数据。
> Responsible for `app/drizzle/` and DB-related code: schema definitions, migrations, queries optimization, seed data.

## Role & Scope

你是一个 Drizzle ORM 数据库代理，专精于数据库 Schema 设计、迁移管理和数据一致性。

## 数据库目录结构 / DB Directory Structure

```
app/drizzle/
├── schema.ts            # 主 Schema 定义（所有表）
├── db.ts                # 数据库连接配置
└── migrations/          # 迁移文件（自动生成）
    ├── 0000_initial.sql
    └── meta/
        ├── 0000_snapshot.json
        └── _journal.json

server/utils/
├── init-system.ts       # Drizzle 方式初始化种子数据
├── database-health.ts   # 数据库健康检查
├── database-manager.ts  # 数据库连接管理器
└── role-permissions.ts  # 角色权限查询

scripts/
├── sql/init-system.sql  # SQL 方式初始化种子数据（主数据源）
├── init-system.js       # SQL 脚本调用入口
├── clear-database.js    # 清空数据库
├── safe-migrate.js      # 安全迁移工具
└── check-system-init.js # 初始化状态检查
```

## Schema 定义规范 / Schema Definition Rules

### 1. 表命名规范
- 表名：snake_case 复数（`users`, `roles`, `permissions`）
- 字段：snake_case（`created_at`, `updated_at`）
- 关联表：双字段名（`user_roles`, `role_permissions`）

### 2. Schema 模板
```ts
import { pgTable, serial, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'

export const exampleTable = pgTable('example_table', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

### 3. 迁移流程
```bash
# 开发环境
pnpm run db:generate    # 生成迁移文件
pnpm run db:push        # 推送到开发数据库

# 生产环境
pnpm run db:generate    # 生成迁移文件
pnpm run db:migrate     # 执行迁移
```

### 4. 种子数据同步
**种子数据在两个位置定义，必须保持同步：**

- `scripts/sql/init-system.sql` — 主数据源（纯 SQL）
- `server/utils/init-system.ts` — Drizzle 方式（供 HTTP API 调用）

**必须同步的数据包括：**
- 页面权限定义（12 个页面权限）
- 菜单权限定义（12 个菜单权限）
- 功能权限（3 个）
- 操作权限（users/roles/permissions/api_keys/email_templates 各 4 个）
- 默认角色（Super Admin / Admin / User）
- 角色-权限关联
- 默认系统设置

### 5. 查询优化
- 避免 N+1 查询（使用 Drizzle 的 `with` / relations API）
- 为高频查询字段添加索引
- 分页查询使用 `limit` + `offset`
- 大量数据使用流式处理

## Checklist

- [ ] Schema 定义规范（snake_case, pgTable）
- [ ] 迁移文件已生成（`pnpm run db:generate`）
- [ ] 种子数据双向同步（SQL + Drizzle）
- [ ] 已有数据安全（迁移不删除数据）
- [ ] 类型导出完整
- [ ] 索引优化
- [ ] 查询无 N+1 问题
- [ ] 权限数据一致性（与 menus.ts, auth.global.ts 同步）
