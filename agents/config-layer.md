# 配置与脚本 Agent — Config & Scripts Layer

> 负责项目配置文件、初始化脚本、CI/CD、部署流程。
> Responsible for project configuration, init scripts, CI/CD, deployment workflows.

## Role & Scope

你是一个项目配置与运维代理，专精于项目根配置文件、`scripts/` 目录下的自动化脚本、以及 CI/CD 流程。

## 配置目录结构 / Config Directory Structure

```
project root/
├── nuxt.config.ts       # Nuxt 主配置
├── drizzle.config.ts    # Drizzle ORM 配置
├── vitest.config.ts     # Vitest 测试配置
├── eslint.config.js     # ESLint 配置
├── tsconfig.json        # TypeScript 配置
├── components.json      # shadcn-vue 组件配置
├── renovate.json        # Renovate 依赖更新配置
├── pnpm-workspace.yaml  # pnpm workspace 配置
├── .env / .env.example  # 环境变量
├── .npmrc               # npm/pnpm 配置
├── docker-compose.yml   # Docker 开发环境
├── .vscode/             # VSCode 配置
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
├── .github/             # GitHub 配置
│   ├── workflows/       # CI/CD 工作流
│   └── ISSUE_TEMPLATE/  # Issue 模板
└── scripts/             # 自动化脚本
    ├── sql/init-system.sql     # SQL 初始化
    ├── init-system.js          # 系统初始化入口
    ├── create-admin.js         # 创建管理员
    ├── clear-database.js       # 清空数据库
    ├── deploy.js               # 部署脚本
    ├── check-deploy.js         # 部署预检
    ├── netlify-build.js        # Netlify 构建
    ├── safe-migrate.js         # 安全迁移
    ├── check-system-init.js    # 初始化检查
    ├── postinstall.js          # 安装后钩子
    ├── init/                   # 初始化 TS 脚本
    │   ├── init-system.ts
    │   └── permission.ts
    └── drizzle/                # 独立迁移目录
```

## 关键配置说明 / Key Config Notes

### 1. nuxt.config.ts
- 使用 Nuxt 4 配置格式（`compatibilityDate` 必须设置）
- 模块加载顺序：`@nuxt/eslint` → `@pinia/nuxt` → `@nuxt/icon` → `@vueuse/nuxt` → `shadcn-nuxt` → 自定义
- i18n 配置：使用 `@nuxtjs/i18n` 模块（`i18n/` 目录），见 [i18n-layer](i18n-layer.md)
- PWA/SEO：暂无配置，需要时添加

### 2. 环境变量 (.env)
```
DATABASE_URL=postgres://user:pass@localhost:5432/dbname
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
SMTP_HOST=smtp.example.com
REDIS_URL=redis://localhost:6379
```

### 3. Docker Compose
```yaml
services:
  postgres:  # 数据库
  redis:     # 缓存（可选）
  adminer:   # 数据库管理界面
```

### 4. CI/CD 工作流
- 检查：lint + typecheck + test
- 构建：nuxt build
- 部署：支持 Docker + Netlify

### 5. 脚本说明
| 命令 | 脚本 | 说明 |
|------|------|------|
| `pnpm run db:init` | `scripts/init-system.js` | 通过 SQL 文件初始化数据库 |
| `pnpm run admin:create` | `scripts/create-admin.js` | 创建管理员用户（交互式） |
| `pnpm run db:clear` | `scripts/clear-database.js` | 清空所有表数据 |
| `pnpm run setup:full` | setup:full | db:init + admin:create |
| `pnpm run setup:check` | `scripts/check-system-init.js` | 检查系统是否已初始化 |

## Checklist

- [ ] 环境变量完整（`.env` 与 `.env.example` 同步）
- [ ] 配置文件版本对齐（Nuxt / Drizzle / TypeScript）
- [ ] 脚本执行正常（`pnpm run setup:check`）
- [ ] CI/CD 配置正确
- [ ] Docker Compose 可用
- [ ] ESLint + Prettier 配置一致
- [ ] VS Code 推荐扩展配置
- [ ] 安全配置（无硬编码密钥）
