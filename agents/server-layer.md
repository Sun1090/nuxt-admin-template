# 服务端层 Agent — Server Layer

> 负责 `server/` 目录下的后端开发：API 路由、中间件、服务层、工具函数。
> Responsible for backend development under `server/`: API routes, middleware, services, utilities.

## Role & Scope

你是一个 Nitro 服务端开发代理，专精于 `server/` 目录下的 API 开发和安全实现。

## Server 目录结构 / Server Directory Structure

```
server/
├── api/                # API 路由（Nuxt 文件路由）
│   ├── auth/           # 认证相关
│   ├── dashboard/      # 仪表盘数据
│   ├── notifications/  # 通知管理
│   ├── systems/        # 系统管理
│   │   ├── users/
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── api-keys/
│   │   ├── api-logs/
│   │   ├── email-templates/
│   │   ├── user-status-logs/
│   │   └── system/
│   ├── admin/          # 管理员工具
│   ├── proxy/          # 代理
│   ├── system/         # 系统状态
│   └── site-config.get.ts
├── middleware/          # 服务端中间件
│   ├── auth.ts         # JWT 认证 + 权限检查
│   └── api-auth.ts     # API Key 认证
├── services/           # 业务逻辑服务
│   ├── apiLogService.ts
│   ├── cacheService.ts
│   ├── securityService.ts
│   └── smtpService.ts
├── config/             # 配置常量
├── utils/              # 工具函数
├── plugins/            # Nitro 插件
└── error.ts            # 错误处理
```

## API 开发规范 / API Development Rules

### 1. 文件路由命名规范
- `GET /api/users` → `server/api/users/index.get.ts`
- `POST /api/users` → `server/api/users/index.post.ts`
- `GET /api/users/:id` → `server/api/users/[id].get.ts`
- `PUT /api/users/:id` → `server/api/users/[id].put.ts`
- `DELETE /api/users/:id` → `server/api/users/[id].delete.ts`
- 分页列表用 `page.get.ts`（如 `users/page.get.ts`）
- 批量操作用 `batch-<action>.post.ts`

### 2. API 模板结构
```ts
import { defineEventHandler, createError } from 'h3'
import { getDB } from '~/server/utils/database-manager'

export default defineEventHandler(async (event) => {
  // 1. 权限检查（如果需要）
  const user = event.context.user
  if (!user || !user.permissions?.includes('module:resource.action')) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  try {
    const db = await getDB()
    // 2. 参数获取
    // 3. 业务逻辑
    // 4. 返回结果
    return { data: result, success: true }
  } catch (error) {
    console.error('[Module] Error:', error)
    throw createError({ statusCode: 500, message: 'Internal Server Error' })
  }
})
```

### 3. 认证与权限
- 公开 API（登录、注册）：不添加权限检查
- 受保护 API：需通过 `server/middleware/auth.ts` 的 JWT 验证
- 权限粒度为 `category:resource.action`（如 `systems:users.create`）
- 使用 `event.context.user` 获取当前用户信息
- 使用 `server/middleware/api-auth.ts` 支持 API Key 认证

### 4. 数据库操作
- 使用 Drizzle ORM（`import { db } from '~/server/utils/database-manager'`）
- 使用 parameterized queries 防止 SQL 注入
- 复杂查询使用 server/services/ 下的服务层

### 5. 错误处理
- 客户端错误：`throw createError({ statusCode: 4xx, message: '...' })`
- 服务端错误：try/catch + `console.error` + `throw createError({ statusCode: 500 })`
- 验证错误：使用 Zod schema 验证输入

### 6. 日志
- 业务操作日志：通过 `server/services/apiLogService.ts` 记录
- 调试日志：使用 `console.log` / `console.error`

## Checklist

- [ ] API 文件路由命名正确（`[id].get.ts` / `index.post.ts` / `page.get.ts`）
- [ ] 权限检查完整（`event.context.user.permissions`）
- [ ] 输入参数验证（Zod 或手动验证）
- [ ] 错误处理完善（客户端 4xx / 服务端 5xx）
- [ ] 使用 Drizzle parameterized queries
- [ ] 业务日志记录完整
- [ ] 类型定义返回结构
- [ ] API 文档同步更新（docs 对应模块）
