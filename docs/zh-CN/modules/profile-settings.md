---
outline: deep
---

# 个人设置

用于个人用户的设置页面 — 个人信息、账户安全、外观偏好、显示设置和通知设置。

## 功能特性

### 个人资料
更新个人信息：头像、显示名称、邮箱和手机号。

### 账户
账户安全管理：修改密码、查看最后登录时间和 IP。

### 外观
视觉主题自定义：亮色/暗色/跟随系统主题切换、侧边栏折叠状态。

### 显示
显示偏好：紧凑模式开关、动画偏好。

### 通知设置
每用户通知偏好：开启/关闭系统通知。

## API 接口

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| POST | /api/auth/change-password | 修改当前用户密码 |

## 相关组件

- app/pages/settings/profile.vue — 个人资料页面
- app/pages/settings/account.vue — 账户安全页面
- app/pages/settings/appearance.vue — 外观设置页面
- app/pages/settings/display.vue — 显示设置页面
- app/pages/settings/notifications.vue — 通知设置页面
