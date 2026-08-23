---
outline: deep
---

# 常见问题

常见使用问题和故障排除。

## 通用

### 如何重置管理员密码？
重新运行管理员创建脚本即可更新密码。

### 如何添加新数据表？
在 schema.ts 中定义表，运行 db:generate 和 db:migrate。

### 如何添加新权限？
在 init-system.sql 中添加记录，重新运行 db:init。

## 认证

### 登录后跳回登录页
检查 JWT_SECRET 是否已配置，确认浏览器未拦截 Cookie。

### 强制修改密码循环
新账户默认 forcePasswordChange=true。在个人设置中设置新密码即可。

## 数据库

### db:push 报错表已存在
先运行 db:drop 清空表再运行 db:push。生产环境使用迁移。

## TypeScript

### vue-router/volar 模块未找到
postinstall 脚本会自动修复该问题。如果仍有问题，重新运行 pnpm install。

## 权限

### 用户能看到页面但无法操作
确认用户角色已分配所需的 action: 权限。超级管理员绕过所有检查。

### 菜单项不显示
确认菜单已在 menus.ts 中定义，且用户角色已分配对应的 menu: 权限。

## API 密钥

### API 密钥无法使用
检查密钥是否已激活、权限是否已分配、是否已过期。API 密钥通过 x-api-key 头传递。

### 创建后丢失完整密钥
API 密钥仅在创建时显示一次。需要重新生成新密钥。

## 其他

### 如何修改站点 Logo？
在系统设置中更新站点 Logo URL 字段。

### 能否使用 MySQL？
目前不支持。Schema 使用了 PostgreSQL 特有功能。

### Redis 是必须的吗？
不是。Redis 是可选的认证缓存，系统不安装也能正常运行。
