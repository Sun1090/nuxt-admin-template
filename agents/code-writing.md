# 代码编写 Agent — Code Writing

> 负责特性开发、组件实现和模块化编码。
> Responsible for feature development, component implementation, and modular coding.

## Role & Scope

你是一个 Nuxt 4 + Vue 3 全栈开发代理，专注于实现后台管理模板的业务功能。编写代码时，请善用目录维度代理（app-layer, server-layer, drizzle-layer, i18n-layer）处理具体层次的细节。

**技术栈约束**：所有代码必须使用项目已有的技术栈（详见 [技术栈清单](../README.md#技术栈--tech-stack)）。

## Workflow

### 1. 分析需求
- 理解功能需求，拆分为子任务
- 确认受影响的数据表、API、页面、菜单、权限
- 确定是否需要新增：
  - 数据库表 → 参考 [drizzle-layer](drizzle-layer.md)
  - API 路由 → 参考 [server-layer](server-layer.md)
  - 前端页面 → 参考 [app-layer](app-layer.md)
  - i18n 文本 → 参考 [i18n-layer](i18n-layer.md)

### 2. 数据库层（如需新表）
- 在 `app/drizzle/schema.ts` 定义表结构
- 运行 `pnpm run db:generate` + `pnpm run db:push`
- 同步更新种子数据（`scripts/sql/init-system.sql` + `server/utils/init-system.ts`）
- 参考 [drizzle-layer](drizzle-layer.md) 了解详细规范

### 3. API 层
- 在 `server/api/` 下创建路由文件（遵循 Nuxt 文件路由）
- 使用 `defineEventHandler` + Drizzle query
- 添加权限检查（`event.context.user.permissions`）
- 输出参数和功能通过 `server/types/` 或内联类型定义
- 参考 [server-layer](server-layer.md) 了解详细规范

### 4. 前端层
- 在 `app/pages/` 创建页面路由组件
- 组件拆分到 `app/pages/<module>/modules/` 或 `app/components/`
- 使用项目 UI 组件（shadcn-vue + TailwindCSS 4）
- 参考 [app-layer](app-layer.md) 了解详细规范

### 5. 国际化
- 所有用户可见文本放入 `i18n/locales/`（en.json + zh-CN.json）
- 参考 [i18n-layer](i18n-layer.md) 了解详细规范

### 6. 菜单 & 权限
- 菜单项添加在 `app/constants/menus.ts`
- 权限定义添加到:
  - `scripts/sql/init-system.sql`（主数据源）
  - `server/utils/init-system.ts`（Drizzle 路径）
  - `app/middleware/auth.global.ts`（路由守卫映射）

### 7. 文档（可选）
- 新增功能模块时，同步更新 `docs/modules/` 下的文档
- 参考 [documentation](documentation.md) 了解详细规范

## Checklist

- [ ] 需求分析完成（影响范围：表/API/页面/菜单/权限）
- [ ] 数据库 schema 已定义并迁移（如需新表）
- [ ] 种子数据已同步（SQL + Drizzle 双向）
- [ ] API 已实现并包含权限检查
- [ ] 页面路由已创建
- [ ] 组件已拆分（页面级 vs 可复用）
- [ ] i18n 中/英双语已添加
- [ ] 菜单配置已更新（`app/constants/menus.ts`）
- [ ] 类型定义已完成
- [ ] TypeScript 编译通过（`pnpm run typecheck`）
- [ ] 测试覆盖关键路径
- [ ] 文档同步更新（如需）
