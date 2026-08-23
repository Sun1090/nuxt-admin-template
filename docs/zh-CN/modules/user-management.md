---
outline: deep
---

# 用户管理

系统用户的完整 CRUD 管理，包括状态控制、密码重置（单用户和批量）、搜索和分页。

## 功能特性

- **创建/编辑** — 通过模态对话框添加新用户或修改现有用户
- **状态控制** — 在 active、inactive、suspended 之间切换
- **密码重置** — 重置单个用户密码或批量重置选中用户
- **搜索** — 按用户名、姓名、邮箱、手机号、角色和状态筛选
- **分页** — 可配置每页条数，服务端分页
- **批量操作** — 选中多个用户批量修改状态或重置密码

## API 接口

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/systems/users/page | 分页用户列表 |
| GET | /api/systems/users/[id] | 获取用户详情 |
| POST | /api/systems/users | 创建用户 |
| PUT | /api/systems/users/[id] | 更新用户 |
| DELETE | /api/systems/users/[id] | 删除用户 |
| PUT | /api/systems/users/[id]/status | 修改用户状态 |
| POST | /api/systems/users/[id]/reset-password | 重置密码 |
| POST | /api/systems/users/batch-status | 批量修改状态 |
| POST | /api/systems/users/batch-reset-password | 批量重置密码 |

## 权限

| 权限 | 作用 |
| --- | --- |
| page:users | 访问用户管理页面 |
| menu:user_mgmt | 显示用户菜单 |
| action:user.create | 创建用户 |
| action:user.edit | 编辑用户 |
| action:user.delete | 删除用户 |
| action:user.status | 修改用户状态 |
| action:user.resetPassword | 重置密码 |

## 相关组件

- app/pages/systems/users/index.vue — 主页面
- app/pages/systems/users/modules/ListTable.vue — 数据表格
- app/pages/systems/users/modules/ListSearch.vue — 搜索筛选栏
- app/pages/systems/users/modules/AddDialog.vue — 创建/编辑对话框
- app/pages/systems/users/modules/DeleteDialog.vue — 删除确认
- app/pages/systems/users/modules/ResetDialog.vue — 密码重置对话框

## 类型定义

见 app/types/api/systems/user.d.ts。
