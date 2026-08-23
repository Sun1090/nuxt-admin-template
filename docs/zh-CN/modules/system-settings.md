---
outline: deep
---

# 系统设置

从统一的设置页面配置全局系统参数 — 品牌信息、显示选项和注册控制。

## 功能特性

- **站点标识** — 站点标题、描述、Logo URL
- **备案号** — 中国工信部 ICP 备案号
- **登录背景** — 自定义登录页背景图片 URL
- **注册控制** — 切换用户自助注册和验证码
- **默认角色** — 自助注册用户的默认角色

## API 接口

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/systems/settings | 获取系统设置 |
| PUT | /api/systems/settings | 更新系统设置 |

## 权限

| 权限 | 作用 |
| --- | --- |
| page:system_settings | 访问系统设置页面 |
| action:settings.edit | 编辑系统设置 |

## 相关组件

- app/pages/systems/settings/index.vue — 主页面

## 类型定义

见 app/types/api/systems/settings.d.ts。
