---
outline: deep
---

# API 访问日志

监控和审计使用 API 密钥进行的 API 调用，提供每次请求的详细日志。

## 功能特性

- **日志列表** — 所有 API 访问日志的分页列表
- **筛选** — 按接口路径、HTTP 方法、状态码筛选
- **详情查看** — 查看完整的请求和响应体用于调试

## API 接口

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/systems/api-logs/page | 分页日志列表 |

## 权限

| 权限 | 作用 |
| --- | --- |
| page:api_logs | 访问 API 日志页面 |
| action:apilog.export | 导出日志 |

## 相关组件

- app/pages/systems/api-logs/index.vue — 主页面

## 类型定义

见 app/types/api/systems/api-logs.d.ts。
