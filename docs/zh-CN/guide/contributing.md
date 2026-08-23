---
outline: deep
---

# 贡献指南

参与 Nuxt Admin Template 开发的指南。

## 开发环境搭建

```bash
git clone <仓库地址>
cd template
pnpm install
cp .env.example .env
# 编辑 .env 配置数据库连接
pnpm run db:push
pnpm run db:init
pnpm run admin:create
pnpm run dev
```

## 项目结构

app/ — 前端（Vue 组件、页面、composable）
server/ — 后端（API 端点、中间件、服务层）
scripts/ — CLI 工具
docs/ — VitePress 文档

## 编码规范

- TypeScript 严格模式，所有函数使用显式类型
- ESLint 使用 @antfu/eslint-config 配置
- Vue 文件使用 PascalCase，TS 文件使用 camelCase

## 添加新功能流程

1. 在 app/drizzle/schema.ts 中定义数据表
2. 在 server/api/ 下创建接口文件
3. 在 app/types/api/ 中添加类型定义
4. 在 app/pages/ 下创建页面文件
5. 将可复用逻辑提取到 app/components/
6. 在 app/constants/menus.ts 中注册菜单
7. 在初始化 SQL 和权限常量中添加权限
8. 在 app/middleware/auth.global.ts 中注册权限
9. 更新文档

## 提交信息

遵循约定式提交格式：

feat: 添加用户批量密码重置功能
fix: 修复移动端分页溢出的问题
docs: 添加部署指南
refactor: 简化认证中间件
chore: 升级 Nuxt 到 4.5.0
