---
outline: deep
---

# 邮件模板

管理系统用于通知和系统邮件的 HTML 邮件模板。

## 功能特性

- **CRUD 操作** — 创建、编辑、删除邮件模板
- **HTML 编辑** — 在文本框中编辑模板 HTML
- **模板变量** — 支持模板中的动态变量
- **唯一标识** — 每个模板有唯一的 key 用于程序引用

## API 接口

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/systems/email-templates | 模板列表 |
| GET | /api/systems/email-templates/[id] | 获取模板 |
| POST | /api/systems/email-templates | 创建模板 |
| PUT | /api/systems/email-templates/[id] | 更新模板 |
| DELETE | /api/systems/email-templates/[id] | 删除模板 |

## 权限

| 权限 | 作用 |
| --- | --- |
| page:email_templates | 访问邮件模板页面 |
| action:emailtemplate.create | 创建模板 |
| action:emailtemplate.edit | 编辑模板 |
| action:emailtemplate.delete | 删除模板 |

## 相关组件

- app/pages/systems/email-templates/index.vue — 主页面
- app/pages/systems/email-templates/modules/ListTable.vue — 数据表格
- app/pages/systems/email-templates/modules/AddDialog.vue — 创建/编辑对话框
- app/pages/systems/email-templates/modules/DeleteDialog.vue — 删除确认

## 类型定义

见 app/types/api/systems/email-template.d.ts。
