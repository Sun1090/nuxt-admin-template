# 快速上手指南

按照以下步骤在本地搭建并运行 Nuxt Admin Template。

## 前置要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 20.x | 推荐使用 LTS 版本 |
| pnpm | >= 11.x | 随 Node.js 安装 |
| PostgreSQL | >= 14 | 或使用 Neon、Supabase 等托管服务 |
| Redis | >= 6（可选） | 用于缓存，不安装也能运行 |

## 第一步：复制模板

```bash
cp -r template/ my-admin-project
cd my-admin-project
```

或从 Git 仓库克隆：

```bash
git clone <仓库地址> my-admin-project
cd my-admin-project
```

## 第二步：安装依赖

```bash
pnpm install
```

`postinstall` 脚本会自动执行 `nuxt prepare` 并修复 `.nuxt/tsconfig.json` 中的 `vue-router` 兼容性问题。

## 第三步：配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```txt
# 数据库连接（必填）
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nuxt_admin

# JWT 密钥（必填）—— 生成方式：openssl rand -base64 32
JWT_SECRET=your-random-secret-key

# Redis（可选）
# REDIS_URL=redis://localhost:6379
```

## 第四步：创建数据库

```sql
CREATE DATABASE nuxt_admin;
```

## 第五步：推送表结构

```bash
pnpm run db:push
```

生产环境建议使用 `db:generate` + `db:migrate`。

## 第六步：初始化系统数据

```bash
pnpm run db:init
```

创建默认角色（超级管理员、系统管理员、普通用户）和所有权限记录。

## 第七步：创建管理员账户

```bash
pnpm run admin:create
```

输出：

```
用户名: admin
密码: admin123
角色: 超级管理员
```

## 第八步：启动开发服务器

```bash
pnpm run dev
```

打开 `http://localhost:3000`，使用 `admin / admin123` 登录。

## 登录后可以看到

- **仪表盘**：系统统计数据、最近用户
- **侧边栏**：所有管理模块入口
- **个人设置**：个人信息、密码、外观、通知

## 常见开发流程

### 创建新页面

1. 在 `app/pages/` 下创建 `.vue` 文件
2. 在 `app/constants/menus.ts` 中注册菜单
3. 在 `scripts/sql/init-system.sql` 中添加权限，重新执行 `db:init`
4. 在 `app/middleware/auth.global.ts` 的 `PAGE_PERMISSION_MAP` 中注册

### 创建新 API

1. 在 `server/api/` 下创建文件
2. 在处理器中检查权限：
   ```ts
   const user = event.context.user
   if (!user?.permissions?.includes('action:item.read')) {
     throw createError({ statusCode: 403 })
   }
   ```

### 添加新数据表

1. 在 `app/drizzle/schema.ts` 中定义表和关系
2. 运行 `pnpm run db:generate` + `pnpm run db:migrate`
3. 导出类型

## 生产部署

```bash
pnpm run build
NODE_ENV=production node .output/server/index.mjs
```

### 部署检查清单

- [ ] 已配置 `DATABASE_URL` 和 `JWT_SECRET`
- [ ] `JWT_SECRET` 使用强随机字符串
- [ ] 已设置 `NODE_ENV=production`
- [ ] 使用迁移方式更新数据库
- [ ] 系统数据已初始化
- [ ] 管理员密码已修改

## 故障排除

| 问题 | 解决方案 |
|------|----------|
| 数据库连接失败 | 检查 `DATABASE_URL` 和 PostgreSQL 服务 |
| 登录后跳回登录页 | 检查 `JWT_SECRET`；确认 Cookie 未被拦截 |
| 权限不足 | 确认角色有权限；超级管理员需 `is_superadmin=true` |
| `db:push` 报错 | 确认数据库已创建、连接正确 |
| 类型检查报错 | 先运行 `pnpm run dev` 生成 `.nuxt` 类型文件 |
| `vue-router/volar` 模块未找到 | 项目已自动修复；重跑 `pnpm install` |

## 命令参考

| 命令 | 说明 |
|------|------|
| `pnpm run dev` | 启动开发服务器 |
| `pnpm run build` | 构建生产版本 |
| `pnpm run preview` | 预览生产构建 |
| `pnpm run db:generate` | 生成迁移文件 |
| `pnpm run db:migrate` | 执行数据库迁移 |
| `pnpm run db:push` | 直接推送 Schema（仅开发） |
| `pnpm run db:studio` | 打开 Drizzle Studio |
| `pnpm run db:init` | 初始化默认角色和权限 |
| `pnpm run admin:create` | 创建管理员账户 |
| `pnpm run lint` | ESLint 代码检查 |
| `pnpm run typecheck` | TypeScript 类型检查 |
