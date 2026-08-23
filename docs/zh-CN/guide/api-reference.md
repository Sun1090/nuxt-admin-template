---
outline: deep
---

# API 参考

按模块组织的完整 API 接口参考。

## 认证

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 用户退出 |
| GET | /api/auth/verify | 验证认证状态 |
| POST | /api/auth/change-password | 修改密码 |
| POST | /api/auth/set-initial-password | 设置初始密码 |

## 仪表盘

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/dashboard/stats | 仪表盘统计数据 |

## 用户管理

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/systems/users/page | 分页用户列表 |
| GET | /api/systems/users/[id] | 获取用户详情 |
| POST | /api/systems/users | 创建用户 |
| PUT | /api/systems/users/[id] | 更新用户 |
| DELETE | /api/systems/users/[id] | 删除用户 |
| PUT | /api/systems/users/[id]/status | 修改状态 |
| POST | /api/systems/users/[id]/reset-password | 重置密码 |
| POST | /api/systems/users/batch-status | 批量改状态 |
| POST | /api/systems/users/batch-reset-password | 批量重置密码 |

## 角色管理

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/systems/roles | 全部角色 |
| GET | /api/systems/roles/page | 分页列表 |
| POST | /api/systems/roles | 创建角色 |
| PUT | /api/systems/roles/[id] | 更新角色 |
| DELETE | /api/systems/roles/[id] | 删除角色 |
| GET | /api/systems/roles/[id]/permissions | 获取角色权限 |
| PUT | /api/systems/roles/[id]/permissions | 更新角色权限 |

## 权限管理

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/systems/permissions | 全部权限 |
| GET | /api/systems/permissions/page | 分页列表 |
| POST | /api/systems/permissions | 创建权限 |
| PUT | /api/systems/permissions/[id] | 更新权限 |
| DELETE | /api/systems/permissions/[id] | 删除权限 |

## API 密钥

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/systems/api-keys | 密钥列表 |
| POST | /api/systems/api-keys | 创建密钥 |
| PUT | /api/systems/api-keys/[id] | 更新密钥 |
| DELETE | /api/systems/api-keys/[id] | 删除密钥 |
| GET | /api/systems/api-keys/logs | 访问日志 |

## 其他模块

| 方法 | 接口路径 | 模块 |
| --- | --- | --- |
| GET | /api/systems/api-logs/page | API 访问日志 |
| GET | /api/systems/email-templates | 邮件模板 |
| POST | /api/systems/email-templates | 创建模板 |
| GET | /api/notifications | 通知列表 |
| POST | /api/admin/backup/export | 数据库备份 |
| POST | /api/admin/database/reset | 数据库重置 |
| GET | /api/systems/settings | 系统设置 |
| PUT | /api/systems/settings | 更新系统设置 |
| GET | /api/systems/user-status-logs/page | 用户状态日志 |

## 通用分页参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| page | number | 1 | 页码 |
| pageSize | number | 20 | 每页条数 |
| search | string | — | 搜索关键字 |

## 通用响应格式

```json
{
  "data": { ... },
  "message": "Success"
}
```

分页接口额外返回 total、page、pageSize、totalPages 字段。

## 错误响应

```json
{
  "statusCode": 403,
  "message": "Permission denied",
  "data": null
}
```

常见状态码：200 成功、400 参数错误、401 未登录、403 权限不足、404 资源不存在、429 请求频限、500 服务端错误。
