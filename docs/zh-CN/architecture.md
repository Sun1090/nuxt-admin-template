---
outline: deep
---

# 架构设计

本文档描述 Nuxt Admin Template 的整体架构、目录结构和核心设计决策。

## 目录结构

```
nuxt-admin-template/
├── app/                        # 前端应用
│   ├── assets/css/             # 全局样式
│   ├── components/             # Vue 组件
│   │   ├── layout/             # 布局（Header、Sidebar 等）
│   │   ├── dashboard/          # 仪表盘组件
│   │   ├── settings/           # 设置页面组件
│   │   └── ui/                 # shadcn-vue UI 组件
│   ├── composables/            # Vue 组合式函数
│   ├── constants/              # 常量与菜单配置
│   ├── drizzle/                # Drizzle ORM Schema 与迁移
│   ├── middleware/             # 路由守卫
│   ├── pages/                  # 文件路由页面
│   ├── plugins/                # Nuxt 插件
│   ├── types/                  # TypeScript 类型定义
│   └── utils/                  # 前端工具函数
├── server/                     # 后端
│   ├── api/                    # REST API 接口
│   ├── middleware/             # 服务端中间件
│   ├── services/               # 业务逻辑层
│   └── utils/                  # 服务端工具
├── scripts/                    # CLI 脚本
├── i18n/                       # 国际化（本地化文件、配置）
├── public/                     # 静态资源（logo、favicon）
└── docs/                       # VitePress 文档
```

## 认证流程

```
用户登录
  │
  ├─ POST /api/auth/login
  │    ├─ 验证用户名密码
  │    ├─ 检查 IP/账户锁定
  │    ├─ 生成 JWT Token
  │    └─ 设置 HttpOnly Cookie
  │
  ├─ 后续请求携带 Cookie
  │    └─ server/middleware/auth.ts
  │         ├─ 从 Cookie 提取 Token
  │         ├─ 验证 JWT
  │         ├─ 查询用户 + 角色
  │         ├─ 加载权限列表
  │         ├─ 注入 event.context.user
  │         └─ API 权限检查
  │
  └─ 前端路由守卫
       └─ app/middleware/auth.global.ts
            ├─ 未登录 → 跳转 /login
            └─ 无权限 → 跳转 /403
```

## 权限系统

### 权限分类

| 类别 | 前缀 | 用途 | 示例 |
|------|------|------|------|
| 页面权限 | `page:` | 控制页面访问 | `page:users` |
| 菜单权限 | `menu:` | 控制菜单显示 | `menu:user_mgmt` |
| 操作权限 | `action:` | 控制操作按钮 | `action:user.create` |
| 功能权限 | `feature:` | 控制功能开关 | `feature:admin_access` |

### 权限检查链路

1. **登录** → 设置 JWT Cookie
2. **服务端中间件** → 实时查询权限，注入 `event.context.user.permissions`
3. **API 端点** → 检查 `event.context.user.permissions.includes('action:xxx')`
4. **前端路由** → 中间件检查页面权限
5. **前端组件** → `usePermissions().canPerformAction(resource, action)`

### 超级管理员

`is_superadmin = true` 的角色自动拥有所有权限。

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

## 缓存策略

Redis 为可选：
- 配置 `REDIS_URL` 后，认证信息缓存，减少数据库查询
- 未配置时系统正常运行，每次请求查询数据库
- 缓存 Key：`auth:user:{userId}`，密码/状态变更时自动清除

## 安全机制

| 机制 | 说明 |
|------|------|
| JWT + HttpOnly Cookie | Token 不暴露给 JS，防 XSS |
| IP 限流 | 登录失败多次后锁定 IP |
| 账户锁定 | 登录失败多次后锁定账户 |
| 密码哈希 | bcrypt 12 轮加密 |
| 强制改密 | 新用户首次登录强制修改密码 |
| CSRF | SameSite=Lax Cookie 策略 |
| API Key 认证 | SHA-256 哈希存储 |
