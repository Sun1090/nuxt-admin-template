# 模板介绍

## 什么是 Nuxt Admin Template？

**Nuxt Admin Template** 是一个功能完善、生产可用的后台管理模板，基于 Nuxt 4 + Vue 3 生态构建。开箱即用地提供了用户管理、基于角色的权限控制（RBAC）、API 密钥管理、数据库管理以及系统配置等完整的后台管理体验。

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Nuxt 4 (SSR/SSG), Vue 3 |
| UI | shadcn-vue, TailwindCSS 4, reka-ui |
| 图标 | Lucide Vue, Radix Icons |
| ORM | Drizzle ORM (PostgreSQL) |
| 认证 | JWT (HttpOnly Cookie) + bcrypt |
| 缓存 | Redis（可选） |
| 表单 | vee-validate + Zod |
| 表格 | @tanstack/vue-table |
| 图表 | ECharts, @unovis/vue |
| 状态管理 | Pinia |
| 工具库 | VueUse, date-fns |
| 语言 | TypeScript |
| 国际化 | @nuxtjs/i18n (vue-i18n), JSON 本地化文件 |
| 代码检查 | ESLint (antfu 配置) |
| 包管理 | pnpm |

## 功能特性

### 认证与安全

- 基于 JWT 的登录机制，Token 存储在 HttpOnly Cookie 中
- bcrypt 12 轮密码加密
- IP 限流与账户锁定
- 首次登录强制修改密码
- CSRF 防护（SameSite=Lax）

### RBAC 权限系统

- 四类权限：**页面权限**、**菜单权限**、**操作权限**、**功能权限**
- 基于角色的权限分配，超级管理员自动拥有全部权限
- 前端路由守卫 + 组件级 + 后端中间件三层权限检查

### 系统模块

| 模块 | 功能 |
|------|------|
| **仪表盘** | 系统数据概览、最近用户、快捷操作 |
| **用户管理** | 增删改查、状态切换、批量密码/状态操作、搜索分页 |
| **角色管理** | 增删改查、权限分配、成员概览 |
| **权限管理** | 按分类（页面/菜单/操作/功能）管理、增删改查 |
| **API 密钥管理** | 密钥生成、权限绑定、使用统计、访问日志 |
| **API 访问日志** | 按接口路径/请求方法/状态码筛选、分页 |
| **邮件模板** | 增删改查、模板编辑 |
| **用户状态日志** | 用户启用/停用/暂停等状态变更历史 |
| **数据库管理** | 备份导出/恢复、序列重置、数据库重置 |
| **系统设置** | 站点标题、Logo、描述、备案号、登录背景、注册开关 |
| **个人设置** | 个人信息、密码修改、外观偏好、通知设置 |

## 设计理念

1. **文件路由** — 利用 Nuxt 自动路由，页面结构清晰直观
2. **前后端同构** — API 端点在 `server/api/` 中按业务路径组织，与页面结构对应
3. **权限优先** — 每个 API 和页面默认受权限保护，显式选择放行
4. **类型安全** — 使用 Drizzle ORM，从数据库 Schema 到查询结果全程 TypeScript 类型推断
5. **最小依赖** — 只包含必要的库，没有冗余

## 项目结构

```
├── app/                      # 前端
│   ├── components/           # Vue 组件
│   ├── composables/          # useAuth, usePermissions, usePagination, ...
│   ├── constants/            # 菜单配置、全局常量
│   ├── drizzle/              # Schema、数据库连接、迁移
│   ├── middleware/           # 路由守卫
│   ├── pages/                # 文件路由页面
│   ├── plugins/              # Nuxt 插件
│   ├── types/                # TypeScript 类型定义
│   └── utils/                # 辅助函数
├── server/                   # 后端
│   ├── api/                  # REST 接口
│   ├── middleware/            # JWT 认证、API Key 认证
│   ├── services/              # 业务逻辑层
│   └── utils/                # 服务端工具
├── scripts/                  # CLI 脚本
├── i18n/                     # 国际化（本地化文件、配置）
└── docs/                     # VitePress 文档
```
