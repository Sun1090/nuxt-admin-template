---
outline: deep
---

# 仪表盘

仪表盘是登录后的首页，提供系统状态概览、最近活动和快捷操作入口。

## 数据概览

六个统计卡片展示从 `GET /api/dashboard/stats` 获取的关键指标：

| 指标 | 说明 |
|------|------|
| 用户总数 | 系统注册用户总数 |
| 角色总数 | 系统角色数量 |
| 活跃 API 密钥 | 当前活跃的 API 密钥数 |
| API 调用次数 | API 调用总次数 |
| 今日登录 | 当日独立登录用户数 |
| 活跃会话 | 最近 30 分钟活跃用户数 |

每个卡片在页面加载时自动获取数据，加载中显示骨架屏，数值使用 `<NumberFlow>` 动画组件展示。

### 接口

```http
GET /api/dashboard/stats
```

## 相关组件

- `app/components/dashboard/card-data.vue` — 统计卡片
- `app/components/dashboard/header-banner.vue` — 欢迎横幅
- `app/components/dashboard/quick-actions.vue` — 快捷操作按钮
- `app/components/dashboard/recent-users.vue` — 最近注册用户列表

## 类型定义

见 `app/types/api/dashboard.d.ts`。
