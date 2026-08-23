---
outline: deep
---

# 权限管理

管理系统中的所有权限，分为页面、菜单、操作、功能四大类别。

## 权限类别

| 类别 | 前缀 | 用途 | 示例 |
| --- | --- | --- | --- |
| 页面 | page: | 控制页面访问 | page:users |
| 菜单 | menu: | 控制菜单显示 | menu:user_mgmt |
| 操作 | action: | 控制操作按钮 | action:user.create |
| 功能 | feature: | 控制功能开关 | feature:admin_access |

## 功能特性

- **CRUD 操作** — 创建、编辑、删除权限
- **分类筛选** — 按权限类别筛选
- **搜索** — 按名称或资源关键字搜索

## API 接口

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/systems/permissions/page | 分页权限列表 |
| GET | /api/systems/permissions | 所有权限 |
| POST | /api/systems/permissions | 创建权限 |
| PUT | /api/systems/permissions/[id] | 更新权限 |
| DELETE | /api/systems/permissions/[id] | 删除权限 |

## 权限检查链路

1. 服务端中间件实时查询权限，注入到 event.context.user.permissions
2. API 端点检查 user.permissions.includes('action:xxx')
3. 前端 page-auth.ts 中间件检查页面权限
4. 前端组件 usePermissions().canPerformAction(resource, action)

## 相关组件

- app/pages/systems/permissions/index.vue — 主页面
- app/pages/systems/permissions/modules/ListTable.vue — 数据表格
- app/pages/systems/permissions/modules/ListSearch.vue — 搜索筛选栏
- app/pages/systems/permissions/modules/AddDialog.vue — 创建/编辑对话框
- app/pages/systems/permissions/modules/DeleteDialog.vue — 删除确认

## 类型定义

见 app/types/api/systems/permission.d.ts。
