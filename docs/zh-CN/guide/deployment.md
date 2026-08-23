---
outline: deep
---

# 生产部署

将 Nuxt Admin Template 部署到生产环境的指南。

## 前置要求

- PostgreSQL 数据库（版本 >= 14）
- Node.js >= 20.x 运行环境
- （可选）Redis 缓存

## 构建

```bash
pnpm run build
```

构建输出在 .output/ 目录。

## 环境变量

确保在生产服务器上设置以下变量：

```txt
DATABASE_URL=postgresql://user:password@host:5432/nuxt_admin
JWT_SECRET=your-production-secret-key
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
# REDIS_URL=redis://localhost:6379
```

## 运行

### Node.js 直接运行

```bash
NODE_ENV=production node .output/server/index.mjs
```

### PM2 进程管理

```bash
ppnpm install -g pm2
NODE_ENV=production pm2 start .output/server/index.mjs --name nuxt-admin
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install && pnpm run build
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
ENV NODE_ENV=production
```

## 数据库迁移

生产环境使用迁移文件而不是 db:push：

```bash
pnpm run db:generate
pnpm run db:migrate
```

## 部署检查清单

- DATABASE_URL 已配置且可访问
- JWT_SECRET 使用强随机字符串
- NODE_ENV=production 已设置
- 使用迁移更新数据库
- 系统数据已初始化
- 管理员密码已修改
- 配置了 HTTPS
- 定期备份已安排
