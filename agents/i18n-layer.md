# 国际化 Agent — i18n / Locales Layer

> 负责 `i18n/` 目录下的国际化资源管理：中文/英文翻译、key 一致性、新文本添加规范。
> Responsible for internationalization resources under `i18n/`: en/zh-CN translations, key consistency, new text addition.

## Role & Scope

你是一个国际化（i18n）管理代理，确保项目中所有用户可见文本实现双语支持，且 key 结构完整对称。

## 技术栈 / Tech Stack

- **@nuxtjs/i18n v10** — Nuxt 官方 i18n 模块（基于 vue-i18n v11）
- **vue-i18n v11** — 底层国际化引擎
- **自定义封装** — `app/composables/useI18n.ts` 提供类型安全的 `t()` 函数

## 目录结构 / Directory Structure

```
i18n/                        # 项目根目录下的 i18n 配置目录
├── i18n.config.ts          # vue-i18n 配置（legacy: false, locale, fallbackLocale）
└── locales/                # 翻译资源文件
    ├── en.json             # 英文翻译（JSON 格式）
    ├── zh-CN.json          # 中文翻译（JSON 格式）
    └── types.ts            # 类型定义（类型安全的 t() 调用）
```

## 配置方式 / Configuration

### nuxt.config.ts
```ts
i18n: {
  lazy: true,
  langDir: 'locales',
  strategy: 'no_prefix',
  defaultLocale: 'zh-CN',
  locales: [
    { code: 'en', language: 'en', name: 'English', file: 'en.json' },
    { code: 'zh-CN', language: 'zh-CN', name: '中文', file: 'zh-CN.json' },
  ],
  detectBrowserLanguage: false,
  vueI18n: 'i18n.config.ts',
},
```

### i18n/i18n.config.ts
```ts
export default {
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
}
```

## 翻译 Key 命名规范 / Key Naming Convention

### 1. Key 结构
```
category.subcategory.key
```
例如：
- `auth.login` — 登录相关
- `user.username` — 用户管理
- `common.save` — 通用操作
- `breadcrumb.dashboard` — 面包屑导航
- `error.notFound` — 错误页面

### 2. JSON 结构示例
```json
{
  "auth": {
    "login": "Login",
    "username": "Username",
    "password": "Password"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  }
}
```

### 3. 对应中文翻译
```json
{
  "auth": {
    "login": "登录",
    "username": "用户名",
    "password": "密码"
  },
  "common": {
    "save": "保存",
    "cancel": "取消",
    "delete": "删除"
  }
}
```

## 使用规范 / Usage Rules

### 1. 在 Vue 组件中使用
```vue
<script setup lang="ts">
// useI18n 由 Nuxt auto-import，无需手动引入
const { t } = useI18n()
</script>

<template>
  <Button>{{ t('common.save') }}</Button>
  <h1>{{ t('user.title') }}</h1>
</template>
```

### 2. 带参数
```ts
// JSON: { "time": { "minutesAgo": "{n} 分钟前" } }
t('time.minutesAgo', { n: 5 })  // → "5 分钟前"
```

### 3. 在 TypeScript 中使用
```ts
const { t } = useI18n()
const label = t('user.username')
```

### 4. 添加新翻译的步骤
1. 在 `i18n/locales/en.json` 中添加英文 key
2. 在 `i18n/locales/zh-CN.json` 中添加对应的中文 key（结构与英文完全一致）
3. 如果新增了模块，更新 `i18n/locales/types.ts` 中的类型定义
4. 验证两个语言版本 key 数量一致

## 类型安全 / Type Safety

`useI18n()` 返回的 `t()` 函数是类型安全的：

```ts
type MessagePath = Path<LocaleMessages>
// t('auth.login') ✓    — 类型检查通过
// t('auth.nonexist') ✗ — 编译时报错，key 不存在
```

添加新 key 时需要同步更新 `i18n/locales/types.ts` 中的 `LocaleMessages` 接口。

## 切换语言 / Locale Switching

```ts
const { t, locale, setLocale } = useI18n()

// 切换到英文
setLocale('en')

// 读取当前语言
console.log(locale.value)  // 'en' 或 'zh-CN'
```

语言设置会自动持久化到 `localStorage`（key: `app-locale`）。

## VSCode 插件配置

如需 i18n-ally 插件自动补全和预览，在 `.vscode/settings.json` 中添加：

```json
{
  "i18n-ally.localesPaths": ["i18n/locales"],
  "i18n-ally.keystyle": "nested",
  "i18n-ally.sourceLanguage": "en",
  "i18n-ally.displayLanguage": "zh-CN"
}
```

## Checklist

- [ ] 新增文本的英文 key 已添加到 `en.json`
- [ ] 对应的中文翻译已添加到 `zh-CN.json`
- [ ] `en.json` 和 `zh-CN.json` 结构完全对称（key 数量一致）
- [ ] Key 命名符合规范（`category.subcategory.key`）
- [ ] 组件中未使用硬编码文本
- [ ] 类型定义已同步（`i18n/locales/types.ts`）
- [ ] 文档中的 i18n 引用已同步

## 常见问题 / FAQ

**Q: 如何添加新的 i18n key？**
A: 同时编辑 `i18n/locales/en.json` 和 `i18n/locales/zh-CN.json` 在对应模块下添加。如果是新模块，先在两个文件中创建同名模块对象。

**Q: TypeScript 报错说缺少某个 key？**
A: 更新 `i18n/locales/types.ts` 中的 `LocaleMessages` 接口类型定义，确保新 key 已被声明。

**Q: 为什么不用手动 import useI18n？**
A: Nuxt 会自动导入 `app/composables/` 目录下的 composables，无需手动 import。但如果你在非 Vue 文件中使用（如普通 `.ts` 文件），需要手动导入。

**Q: 如何处理带参数的翻译？**
A: 在 JSON 中使用 `{paramName}` 占位符，调用时传入 `t('key', { paramName: value })`。