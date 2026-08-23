---
outline: deep
---

# 通知管理

应用内通知系统，支持通知列表、实时未读计数和每用户偏好设置。

## 功能特性

- **通知列表** — 当前用户的分页通知列表
- **筛选标签** — 在全部、未读、已读通知间切换
- **标记已读** — 单条标记已读或全部标记已读
- **未读计数** — 头部铃铛图标实时显示未读数
- **通知设置** — 每用户开关系统通知

## API 接口

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/notifications | 分页通知列表 |
| GET | /api/notifications/unread-count | 未读通知数 |
| PUT | /api/notifications/[id] | 标记已读/未读 |
| POST | /api/notifications/read-all | 全部标记已读 |
| GET | /api/notifications/settings | 获取通知设置 |
| PUT | /api/notifications/settings | 更新通知设置 |

## 权限

| 权限 | 作用 |
| --- | --- |
| page:notifications | 访问通知页面 |
| menu:notifications | 显示通知菜单 |

## 相关组件

- app/pages/systems/notifications/index.vue — 通知列表页面
- app/components/layout/Header.vue — 头部铃铛图标

## 类型定义

见 app/types/api/systems/notification.d.ts。
