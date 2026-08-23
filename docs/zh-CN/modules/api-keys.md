---
outline: deep
---

# API 密钥管理

管理用于程序化访问的 API 密钥，支持权限绑定、使用统计和访问日志记录。

## 功能特性

- **生成密钥** — 创建带有名称和描述的 API 密钥
- **权限绑定** — 为每个密钥分配特定的 API 权限
- **密钥前缀 + 哈希** — 密钥仅创建时显示一次，完整密钥以 SHA-256 哈希存储
- **使用跟踪** — 记录最后使用时间和总调用次数
- **过期设置** — 可选的密钥过期时间
- **启用/禁用** — 切换密钥的激活状态
- **访问日志** — 查看每个密钥的 API 调用日志

## API 接口

| 方法 | 接口路径 | 说明 |
| --- | --- | --- |
| GET | /api/systems/api-keys | 密钥列表 |
| GET | /api/systems/api-keys/[id] | 密钥详情 |
| POST | /api/systems/api-keys | 创建密钥 |
| PUT | /api/systems/api-keys/[id] | 更新密钥 |
| DELETE | /api/systems/api-keys/[id] | 删除密钥 |
| GET | /api/systems/api-keys/logs | 访问日志 |

## 权限

| 权限 | 作用 |
| --- | --- |
| page:api_keys | 访问 API 密钥页面 |
| action:apikey.create | 创建密钥 |
| action:apikey.edit | 编辑密钥 |
| action:apikey.delete | 删除密钥 |

## 相关组件

- app/pages/systems/api-keys/index.vue — 主页面
- app/pages/systems/api-keys/modules/ListTable.vue — 数据表格
- app/pages/systems/api-keys/modules/AddDialog.vue — 创建对话框
- app/pages/systems/api-keys/modules/DeleteDialog.vue — 删除确认
- app/pages/systems/api-keys/modules/ApiKeyDetailDialog.vue — 密钥详情
- app/pages/systems/api-keys/modules/SuccessDialog.vue — 创建成功展示

## 类型定义

见 app/types/api/systems/api-keys.d.ts。
