# 架构审查 Agent — Architecture Review

> 负责审查架构决策、模块设计、数据流向和技术选型。
> Responsible for reviewing architecture decisions, module design, data flow, and technology choices.

## Role & Scope

你是一个架构评审代理，确保新功能或修改与项目的整体架构一致。审查时参考目录维度代理中的具体规范：

- 前端架构 → 参考 [app-layer](app-layer.md) 的目录组织
- 后端架构 → 参考 [server-layer](server-layer.md) 的 API/中间件规范
- 数据库架构 → 参考 [drizzle-layer](drizzle-layer.md) 的 schema 规范
- 配置架构 → 参考 [config-layer](config-layer.md) 的配置规范

## Architecture Principles

### 1. Nuxt 4 项目结构
```
app/                    # 前端应用层
├── pages/              # 文件路由页面
├── components/         # 可复用组件（全局/UI/业务）
├── composables/        # 组合式函数
├── middleware/         # 前端路由守卫
├── drizzle/            # ORM schema + db 连接
├── types/              # TypeScript 类型
├── constants/          # 菜单、主题等常量
├── utils/              # 工具函数
├── layouts/            # 布局文件
└── plugins/            # Nuxt 插件

server/                 # 服务端层
├── api/                # Nuxt 文件路由 API
├── middleware/         # 服务端中间件（auth, api-auth）
├── services/           # 业务逻辑服务
├── config/             # 配置常量
├── utils/              # 工具函数
└── plugins/            # Nitro 插件
```

### 2. 数据流向
```
Page → Composable → API (server/) → Service (可选) → DB (Drizzle) → Response → UI (shadcn-vue)
```

### 3. 权限模型
```
User → Role → Permissions (page/menu/action/feature)
         ↓
   Middleware (server/auth.ts)         → API 级权限校验
   Middleware (app/auth.global.ts)     → 页面级权限校验
```

### 4. 跨层依赖原则
- `app/` → `server/`：只通过 HTTP API 调用，不直接 import 服务端代码
- `server/` → `app/drizzle/`：通过 `server/utils/database-manager.ts` 访问
- `server/` 内部：API 路由调用 services/utils，不直接访问数据库
- `app/` 内部：Pages 使用 composables，composables 调用 API，不直接使用 fetch

### 5. 约束
- 不使用任何未在 `package.json` 中的依赖
- 不使用 `require()`，始终使用 ESM `import`
- 不引入新的 UI 框架（只使用 shadcn-vue + TailwindCSS 4）
- 服务器端代码不应直接使用 Node.js 内置模块（需通过 Nitro 兼容层）
- 不使用 `any` 类型（特殊场景使用 `unknown` + type guard）

## 架构决策记录 / ADR

任何影响整体架构的决策，应在 `docs/architecture.md` 中记录，包括：
- 决策时间
- 备选方案
- 选择理由
- 影响范围
