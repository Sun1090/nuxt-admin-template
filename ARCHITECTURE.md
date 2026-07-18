# 架构文档

本文档描述 Nuxt Admin Template 的整体架构、目录结构和核心设计决策。

## 目录结构

```
nuxt-admin-template/
├── app/                        # 前端应用代码
│   ├── assets/css/             # 全局样式
│   ├── components/             # Vue 组件
│   │   ├── layout/             # 布局组件（Header、Sidebar 等）
│   │   ├── dashboard/          # 仪表盘组件
│   │   ├── settings/           # 设置页面组件
│   │   └── ui/                 # shadcn-vue UI 组件
│   ├── composables/            # Vue 组合式函数
│   │   ├── useAuth.ts          # 认证状态管理
│   │   ├── usePermissions.ts   # 权限检查
│   │   └── ...
│   ├── constants/              # 常量定义
│   │   ├── menus.ts            # 侧边栏菜单配置
│   │   └── constant.ts         # 全局常量
│   ├── drizzle/                # Drizzle ORM
│   │   ├── schema.ts           # 数据库表定义
│   │   ├── db.ts               # 数据库连接
│   │   └── migrations/         # 迁移文件
│   ├── middleware/             # Nuxt 路由中间件
│   │   ├── auth.global.ts      # 全局认证守卫
│   │   └── page-auth.ts        # 页面级权限检查
│   ├── pages/                  # 页面路由（文件路由）
│   │   ├── dashboard.vue
│   │   ├── login.vue
│   │   ├── settings/
│   │   └── systems/            # 系统管理页面
│   │       ├── users/          # 用户管理
│   │       ├── roles/           # 角色管理
│   │       ├── permissions/     # 权限管理
│   │       ├── api-keys/        # API 密钥管理
│   │       └── database/        # 数据库管理
│   ├── plugins/                # Nuxt 插件
│   ├── types/                  # TypeScript 类型定义
│   └── utils/                  # 前端工具函数
├── server/                     # 后端 API 代码
│   ├── api/                    # API 路由
│   │   ├── auth/               # 认证相关
│   │   ├── admin/              # 管理接口（备份、数据库操作）
│   │   └── systems/            # 系统管理 API
│   │       ├── users/          # 用户管理 API
│   │       ├── roles/           # 角色管理 API
│   │       ├── permissions/     # 权限管理 API
│   │       └── api-keys/        # API 密钥管理
│   ├── middleware/             # 服务端中间件
│   │   ├── auth.ts             # JWT 认证 + RBAC 权限检查
│   │   └── api-auth.ts         # Open API 密钥认证
│   ├── services/               # 业务服务层
│   ├── utils/                  # 服务端工具函数
│   ├── config/                 # 配置常量
│   └── plugins/                # 服务端插件
├── scripts/                    # 脚本工具
│   ├── create-admin.js         # 创建管理员
│   ├── sql/init-system.sql     # 初始化系统数据
│   └── ...
├── nuxt.config.ts              # Nuxt 配置
├── drizzle.config.ts           # Drizzle 配置
└── package.json
```

## 认证流程

```
用户登录
  │
  ├─ POST /api/auth/login
  │    ├─ 验证用户名密码
  │    ├─ 检查 IP/账户锁定状态
  │    ├─ 生成 JWT Token
  │    └─ 设置 HttpOnly Cookie (auth-token)
  │
  ├─ 后续请求自动携带 Cookie
  │    └─ server/middleware/auth.ts
  │         ├─ 从 Cookie 提取 Token
  │         ├─ 验证 JWT
  │         ├─ 查询用户信息 + 角色
  │         ├─ 加载用户权限列表
  │         ├─ 注入 event.context.user
  │         └─ API 细粒度权限检查
  │
  └─ 前端路由守卫
       └─ app/middleware/auth.global.ts
            ├─ 未登录 → 跳转 /login
            └─ 页面权限检查 → 无权限跳转 /403
```

## 权限系统设计

### 权限分类

| 类别 | 前缀 | 用途 | 示例 |
|------|------|------|------|
| 页面权限 | `page:` | 控制页面访问 | `page:users`, `page:roles` |
| 菜单权限 | `menu:` | 控制侧边栏菜单显示 | `menu:user_mgmt` |
| 操作权限 | `action:` | 控制具体操作按钮 | `action:user.create` |
| 功能权限 | `feature:` | 控制功能开关 | `feature:admin_access` |

### 权限检查链路

1. **用户登录** → JWT 中不存储权限列表，每次请求实时查询
2. **服务端中间件** (`server/middleware/auth.ts`) → 查询用户权限并注入 `event.context.user.permissions`
3. **API 权限** → 每个 API 端点检查 `event.context.user.permissions.includes('action:xxx')`
4. **前端路由** → `auth.global.ts` 检查页面级权限
5. **前端组件** → `usePermissions().canPerformAction(resource, action)` 控制按钮显隐

### 超级管理员

角色表中 `is_superadmin = true` 的角色自动拥有所有权限，无需逐条分配。

## 数据库设计

### 核心表关系

```
Role ──┬──< User >──┬──< Notification
       │             ├──< NotificationSettings
       │             ├──< UserStatusLog
       │             └──< ApiKey >──┬──< ApiKeyPermission
       │                            └──< ApiLog
       └──< Role_Permissions >── Permissions
```

### Drizzle ORM

- Schema 定义在 `app/drizzle/schema.ts`
- 数据库连接在 `app/drizzle/db.ts`，支持 Neon 和本地 PostgreSQL
- 迁移文件在 `app/drizzle/migrations/`
- 开发阶段使用 `db:push` 快速同步表结构，生产使用 `db:migrate`

## 缓存策略

Redis 为可选依赖：

- 配置 `REDIS_URL` 后，用户认证信息会被缓存，减少数据库查询
- 未配置时系统正常运行，每次请求查询数据库获取用户信息
- 缓存 Key 格式：`auth:user:{userId}`，在密码修改、状态变更时自动清除

## 安全机制

| 机制 | 说明 |
|------|------|
| JWT + HttpOnly Cookie | Token 不暴露给 JS，防 XSS |
| IP 限流 | 登录失败多次后锁定 IP |
| 账户锁定 | 登录失败多次后锁定账户 |
| 密码哈希 | bcrypt 12 轮加密 |
| 强制改密 | 新用户首次登录强制修改密码 |
| CSRF | SameSite=Lax Cookie 策略 |
| API Key | Open API 使用独立密钥认证，SHA-256 哈希存储 |

## 部署

### Node Server（默认）

```bash
npm run build
node .output/server/index.mjs
```

### Vercel

```bash
NITRO_PRESET=vercel npm run build
```

### 环境变量

部署时需配置：
- `DATABASE_URL` - 数据库连接
- `JWT_SECRET` - JWT 密钥
- `REDIS_URL` - Redis 连接（可选）
- `NODE_ENV=production`
