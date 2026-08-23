---
outline: deep
---

# 数据库管理

直接从 UI 管理 PostgreSQL 数据库 — 导出备份、恢复数据、管理序列和重置数据库。

## 功能特性

- **备份导出** — 导出整个数据库结构加数据为 SQL 文件
- **备份恢复** — 上传并从备份文件中恢复
- **序列重置** — 重置所有表序列计数器以修复自增 ID 问题
- **完整重置** — 删除所有表并从迁移文件重建

## API 接口

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| POST | /api/admin/backup/export | 导出数据库备份 |
| POST | /api/admin/backup/restore | 恢复备份 |
| POST | /api/admin/database/reset | 完整重置数据库 |
| POST | /api/admin/fix-sequence | 重置序列 |

## 权限

| 权限 | 作用 |
| --- | --- |
| page:system_database_backup | 访问备份页面 |
| page:system_database_manage | 访问数据库管理页面 |
| action:database.backup | 创建备份 |
| action:database.restore | 恢复备份 |
| action:database.reset | 重置数据库 |

## 相关组件

- app/pages/systems/database/backup/index.vue — 备份页面
- app/pages/systems/database/manage/index.vue — 数据库管理页面

> 警告：数据库重置是破坏性操作。重置前请务必先创建备份。
