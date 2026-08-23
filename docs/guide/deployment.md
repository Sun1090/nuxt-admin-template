---
outline: deep
---

# Deployment

Guide to deploying Nuxt Admin Template to production environments.

## Prerequisites

- PostgreSQL database (version >= 14)
- Node.js >= 20.x runtime
- (Optional) Redis for caching

## Build

```bash
pnpm run build
```

The build output goes to `.output/` directory.

## Environment Variables

Ensure these are set on the production server:

```txt
# Database (required)
DATABASE_URL=postgresql://user:password@host:5432/nuxt_admin

# JWT secret (required) — use a strong random string
JWT_SECRET=your-production-secret-key

# Node environment
NODE_ENV=production

# Host and port (optional, defaults below)
HOST=0.0.0.0
PORT=3000

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

## Running

### Node.js Direct

```bash
NODE_ENV=production node .output/server/index.mjs
```

### Process Manager (PM2)

```bash
ppnpm install -g pm2
NODE_ENV=production pm2 start .output/server/index.mjs --name nuxt-admin
```

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install && pnpm run build
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
ENV NODE_ENV=production
```

```bash
docker build -t nuxt-admin .
docker run -p 3000:3000 --env-file .env nuxt-admin
```

## Database Migrations

For production, use generated migration files instead of `db:push`:

```bash
pnpm run db:generate   # Generate migration SQL
pnpm run db:migrate    # Apply migrations
```

## Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name admin.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name admin.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Deployment Checklist

- [ ] `DATABASE_URL` configured and accessible
- [ ] `JWT_SECRET` is a strong random string (64+ chars)
- [ ] `NODE_ENV=production` set
- [ ] Database migrations applied (not `db:push`)
- [ ] System data initialized (`pnpm run db:init`)
- [ ] Admin password changed from default
- [ ] HTTPS configured (recommended)
- [ ] Regular backups scheduled
- [ ] Log rotation configured

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check if the Node process is running and port is correct |
| Database connection refused | Verify `DATABASE_URL` and network access |
| Session not persisting | Check `JWT_SECRET` is set and consistent |
| Static assets not loading | Run `pnpm run build` to generate proper assets |
| Memory issues | Increase Node memory: `NODE_OPTIONS="--max-old-space-size=512"` |
