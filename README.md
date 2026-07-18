# Nuxt Admin Template

一个基于 Nuxt 4 构建的通用后台管理模板，开箱即用。集成了 RBAC 权限系统、API 密钥管理、数据库备份、系统设置等后台常用功能。

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Nuxt 4 / Vue 3 |
| UI | shadcn-vue + TailwindCSS 4 |
| ORM | Drizzle ORM (PostgreSQL) |
| 认证 | JWT + Cookie |
| 权限 | RBAC（基于角色的权限控制） |
| 缓存 | Redis（可选） |
| 包管理 | npm |

## 功能清单

- **仪表盘**：系统数据概览，快速操作入口
- **用户管理**：用户增删改查、状态切换、密码重置、批量操作
- **角色管理**：角色增删改查、权限分配
- **权限管理**：页面/菜单/操作/功能四类权限
- **API 密钥管理**：Open API 密钥的生成、权限分配、使用统计
- **数据库管理**：备份导出、恢复、序列重置、数据库重置
- **系统设置**：站点标题、Logo 等全局配置
- **个人中心**：个人信息查看与编辑、密码修改
- **主题切换**：亮色/暗色模式

## 快速开始

详细步骤见 [GETTING_STARTED.md](./GETTING_STARTED.md)。

```bash
# 1. 克隆或复制模板
cp -r template/ my-admin-project && cd my-admin-project

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的数据库连接字符串和 JWT 密钥

# 4. 推送数据库表结构到数据库
npm run db:push

# 5. 初始化系统数据（角色、权限）
npm run db:init

# 6. 创建超级管理员账户
npm run admin:create

# 7. 启动开发服务器
npm run dev
```

默认管理员账户：
- 用户名：`admin`
- 密码：`admin123`

## 架构说明

详见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run db:generate` | 生成数据库迁移文件 |
| `npm run db:migrate` | 执行数据库迁移 |
| `npm run db:push` | 直接推送 schema 到数据库（开发用） |
| `npm run db:studio` | 打开 Drizzle Studio 查看数据库 |
| `npm run db:init` | 初始化系统数据（角色、权限） |
| `npm run admin:create` | 创建超级管理员账户 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run lint` | ESLint 代码检查 |

## 数据库表结构

模板包含以下核心表：

| 表名 | 说明 |
|------|------|
| `User` | 用户表 |
| `Role` | 角色表 |
| `Permissions` | 权限表 |
| `Role_Permissions` | 角色-权限关联表 |
| `SystemSettings` | 系统设置表 |
| `Notification` | 通知表 |
| `NotificationSettings` | 通知设置表 |
| `api_keys` | API 密钥表 |
| `api_key_permissions` | API 密钥权限表 |
| `api_logs` | API 访问日志表 |
| `user_status_logs` | 用户状态变更日志 |
| `EmailTemplate` | 邮件模板表 |

## 如何扩展业务模块

1. **添加数据表**：在 `app/drizzle/schema.ts` 中定义新表
2. **生成迁移**：运行 `npm run db:generate`，然后 `npm run db:migrate`
3. **创建 API**：在 `server/api/` 下按业务路径创建接口文件
4. **创建页面**：在 `app/pages/` 下创建对应页面
5. **添加菜单**：编辑 `app/constants/menus.ts` 添加菜单项
6. **添加权限**：在 `scripts/sql/init-system.sql` 中添加权限数据，重新执行 `npm run db:init`
7. **配置页面权限**：在 `app/middleware/auth.global.ts` 的 `PAGE_PERMISSION_MAP` 中注册页面
8. **配置 API 权限**：在 `server/middleware/auth.ts` 的 `OPEN_API_PERMISSION_MAP` 中映射 API 路径

## License

MIT
