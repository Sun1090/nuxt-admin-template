# 快速上手指南

本文档带你从零开始搭建和运行 Nuxt Admin Template。

## 前置要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 20.x | 推荐使用 LTS 版本 |
| npm | >= 10.x | 随 Node.js 安装 |
| PostgreSQL | >= 14 | 或使用 Neon、Supabase 等托管服务 |
| Redis | >= 6（可选） | 用于缓存，不安装也能运行 |

## 第一步：创建项目

```bash
# 方式一：直接复制模板目录
cp -r template/ my-admin-project
cd my-admin-project

# 方式二：如果模板在独立仓库中
git clone <your-template-repo> my-admin-project
cd my-admin-project
```

## 第二步：安装依赖

```bash
npm install
```

安装完成后会自动执行 `nuxt prepare` 生成类型文件。

## 第三步：配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库连接（必填）
# 本地 PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nuxt_admin

# 如果使用 Neon
# DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require

# JWT 密钥（必填）
# 生成随机密钥：openssl rand -base64 32
JWT_SECRET=your-random-secret-key

# Redis（可选）
# REDIS_URL=redis://localhost:6379
```

## 第四步：创建数据库

创建一个空数据库，名称与 `DATABASE_URL` 中一致：

```sql
CREATE DATABASE nuxt_admin;
```

## 第五步：初始化表结构

将 Drizzle Schema 推送到数据库，自动创建所有表：

```bash
npm run db:push
```

> 生产环境建议使用迁移文件：先 `npm run db:generate` 生成迁移，再 `npm run db:migrate` 执行。

## 第六步：初始化系统数据

插入默认的角色、权限数据：

```bash
npm run db:init
```

这会创建以下角色：
- 超级管理员（拥有全部权限）
- 系统管理员（大部分权限，不含权限删除）
- 普通用户（基础查看权限）

以及所有页面、菜单、操作、功能权限。

## 第七步：创建管理员账户

```bash
npm run admin:create
```

输出：
```
用户名: admin
密码: admin123
角色: 超级管理员
```

## 第八步：启动开发服务器

```bash
npm run dev
```

浏览器打开 `http://localhost:3000`，使用默认账户登录。

## 验证

登录后你应该能看到：
- 仪表盘页面，显示系统统计数据
- 侧边栏菜单：用户管理、角色管理、权限管理、API 密钥、数据库管理
- 个人设置页面可修改密码和信息

## 常用开发流程

### 添加新页面

1. 在 `app/pages/` 下创建 `.vue` 文件
2. 在 `app/constants/menus.ts` 中添加菜单项
3. 如需权限控制，在 `scripts/sql/init-system.sql` 中添加权限，重新执行 `db:init`
4. 在 `app/middleware/auth.global.ts` 的 `PAGE_PERMISSION_MAP` 中注册页面

### 添加新 API

1. 在 `server/api/` 下按路径创建文件（如 `server/api/systems/items/index.get.ts`）
2. 在 API 中检查权限：
   ```ts
   const user = event.context.user
   if (!user?.permissions?.includes('action:item.read')) {
     throw createError({ statusCode: 403, message: '没有权限' })
   }
   ```
3. 如需开放 API（使用 API Key 认证），路径以 `/api/open/` 开头，并在 `server/middleware/api-auth.ts` 的 `OPEN_API_PERMISSION_MAP` 中配置

### 添加新数据表

1. 在 `app/drizzle/schema.ts` 中定义表和关系
2. 运行 `npm run db:generate` 生成迁移文件
3. 运行 `npm run db:migrate` 执行迁移
4. 在 `app/drizzle/db.ts` 中确认导出

### 修改菜单

编辑 `app/constants/menus.ts`，添加或修改菜单项：

```ts
{
  title: '商品管理',
  icon: 'lucide:package',
  url: '/products',
  permission: 'menu:product_mgmt',
  children: [
    { title: '商品列表', url: '/products/list' },
    { title: '分类管理', url: '/products/categories' },
  ],
}
```

## 生产部署

### 构建

```bash
npm run build
```

### 运行

```bash
NODE_ENV=production node .output/server/index.mjs
```

### 部署到 Vercel

1. 设置环境变量 `NITRO_PRESET=vercel`
2. 设置 `DATABASE_URL`、`JWT_SECRET` 等变量
3. 构建并部署

### 部署检查清单

- [ ] `.env` 中所有变量已正确配置
- [ ] `JWT_SECRET` 使用了随机字符串（非默认值）
- [ ] `NODE_ENV` 设置为 `production`
- [ ] 数据库已执行迁移
- [ ] 系统数据已初始化
- [ ] 管理员密码已修改
- [ ] `db:push` 仅用于开发，生产使用 `db:migrate`

## 故障排除

### 数据库连接失败

- 检查 `DATABASE_URL` 格式是否正确
- 确认 PostgreSQL 服务正在运行
- Neon 数据库需在连接串中包含 `?sslmode=require`

### 登录后立即跳回登录页

- 检查 `JWT_SECRET` 是否已设置
- 确认 Cookie 未被浏览器拦截（HTTPS 环境）
- 查看服务端日志是否有 JWT 验证错误

### 权限不足

- 确认角色已分配权限（角色管理页面）
- 超级管理员角色检查 `is_superadmin` 是否为 `true`
- 重新执行 `db:init` 初始化权限数据

### `db:push` 报错

- 确认数据库已创建
- 确认连接字符串正确
- 如果是权限问题，检查数据库用户是否有 DDL 权限
