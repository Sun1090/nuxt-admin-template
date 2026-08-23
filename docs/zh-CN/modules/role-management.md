---
outline: deep
---

# 角色管理

基于角色的访问控制（RBAC）管理 — 创建角色、分配权限、查看成员。

## 功能特性

- **创建/编辑角色** — 定义角色名称和描述
- **权限分配** — 为每个角色分配页面/菜单/操作/功能权限
- **成员概览** — 查看每个角色下有哪些用户
- **超级管理员** — is_superadmin=true 的角色绕过所有权限检查

## API 接口

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/systems/roles/page | 分页角色列表 |
| GET | /api/systems/roles | 所有角色 |
| GET | /api/systems/roles/[id] | 获取角色详情 |
| POST | /api/systems/roles | 创建角色 |
| PUT | /api/systems/roles/[id] | 更新角色 |
| DELETE | /api/systems/roles/[id] | 删除角色 |
| GET | /api/systems/roles/[id]/permissions | 获取角色权限 |
| PUT | /api/systems/roles/[id]/permissions | 更新角色权限 |

## 权限

| 权限 | 作用 |
| --- | --- |
| page:roles | 访问角色管理页面 |
| menu:role_mgmt | 显示角色菜单 |
| action:role.create | 创建角色 |
| action:role.edit | 编辑角色 |
| action:role.delete | 删除角色 |
| action:role.assignPermission | 分配权限 |

## 相关组件

- app/pages/systems/roles/index.vue — 主页面
- app/pages/systems/roles/modules/ListTable.vue — 数据表格
- app/pages/systems/roles/modules/ListSearch.vue — 搜索筛选栏
- app/pages/systems/roles/modules/AddDialog.vue — 创建/编辑对话框
- app/pages/systems/roles/modules/DeleteDialog.vue — 删除确认
- app/pages/systems/roles/modules/ResetDialog.vue — 权限分配对话框

## 类型定义

见 app/types/api/systems/role.d.ts。
