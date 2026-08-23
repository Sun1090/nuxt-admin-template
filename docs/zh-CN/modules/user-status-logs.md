---
outline: deep
---

# 用户状态日志

追踪用户状态变更历史 — 用户何时被激活、停用或暂停，以及由谁操作。

## 功能特性

- **状态变更历史** — 查看每个用户的所有状态变更记录
- **筛选** — 按用户ID、旧/新状态和日期范围筛选
- **审计追踪** — 显示每次变更的操作人

## API 接口

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/systems/user-status-logs/page | 分页日志列表 |

## 权限

| 权限 | 作用 |
| --- | --- |
| page:user_status_logs | 访问用户状态日志页面 |

## 相关组件

- app/pages/systems/user-status-logs/index.vue — 主页面

## 类型定义

见 app/types/api/systems/user-status-logs.d.ts。
