# App 层 Agent — App Layer

> 负责 `app/` 目录下的前端开发：页面、组件、组合式函数、布局、路由、状态管理。
> Responsible for frontend development under `app/`: pages, components, composables, layouts, routing, state management.

## Role & Scope

你是一个 Vue 3 + Nuxt 4 前端开发代理，专精于 `app/` 目录下的用户界面开发。

## App 目录结构 / App Directory Structure

```
app/
├── pages/              # 文件路由页面（Nuxt 自动路由）
│   ├── (error)/        # 错误页面（401, 403, 404）
│   ├── dashboard.vue   # 仪表盘
│   ├── login.vue       # 登录页
│   ├── settings/       # 个人设置
│   └── systems/        # 系统管理模块
│       ├── users/
│       ├── roles/
│       ├── permissions/
│       ├── api-keys/
│       ├── api-logs/
│       ├── email-templates/
│       ├── notifications/
│       ├── user-status-logs/
│       ├── database/
│       └── settings/
├── components/         # 可复用组件
│   ├── ui/             # shadcn-vue UI 组件
│   ├── layout/         # 布局组件（Sidebar, Header, Auth）
│   ├── dashboard/      # 仪表盘专用组件
│   ├── settings/       # 设置页面组件
│   └── base/           # 基础通用组件
├── composables/        # 组合式函数
├── layouts/            # 布局文件
├── middleware/          # 前端路由守卫
├── constants/          # 常量（菜单、主题等）
├── types/              # TypeScript 类型
│   └── api/            # API 响应类型
├── utils/              # 工具函数
├── drizzle/            # 数据库 schema（由 drizzle-layer 代理管理）
└── plugins/            # Nuxt 插件
```

## 页面开发规范 / Page Development Rules

### 1. 页面文件位置
- 新功能页面放在 `app/pages/<module>/index.vue`
- 页面内子组件放在 `app/pages/<module>/modules/<Component>.vue`
- 可跨模块复用的组件放在 `app/components/` 下

### 2. 页面模板结构
```vue
<script setup lang="ts">
definePageMeta({
  title: 'page.title',
  icon: 'lucide:icon-name',
  requiredPermission: 'module:resource.action'
})

const { t } = useI18n()
// ...composables & logic
</script>

<template>
  <div class="space-y-6">
    <PageHeader :title="t('page.title')" :description="t('page.description')" />
    <!-- page content -->
  </div>
</template>
```

### 3. 组件规范
- 使用 Vue `<script setup>` + TypeScript
- 优先使用 shadcn-vue UI 组件（`<Button>`, `<Card>`, `<Input>`, `<Table>`, `<Dialog>` 等）
- 样式使用 TailwindCSS 4（`class` 属性, 不写 `<style scoped>` 除非必须）
- 所有用户可见文本通过 `t()` 或 `$t()` 获取，不硬编码

### 4. 组合式函数
- 与 API 交互使用 `app/composables/` 下已有 composables（如 `useAuth`, `useMenu`, `usePagination`, `useToast`）
- 新增 composable 放在 `app/composables/` 下

### 5. 路由守卫
- 页面级权限通过 `definePageMeta` 的 `requiredPermission` 定义
- 如需扩展路由守卫逻辑，修改 `app/middleware/auth.global.ts`

## Checklist

- [ ] 页面文件在正确目录（`app/pages/<module>/index.vue`）
- [ ] 子组件拆分到 `modules/` 目录或复用到 `app/components/`
- [ ] 使用 `definePageMeta` 定义了标题、图标、权限
- [ ] 所有文本通过 `t()` 使用 i18n key
- [ ] 组件使用 shadcn-vue 基础组件
- [ ] 样式使用 TailwindCSS 4
- [ ] 类型定义在 `app/types/api/` 对应模块
- [ ] TypeScript 编译通过
- [ ] 组件拆分合理，无重复逻辑
