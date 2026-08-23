# Agents — Nuxt Admin Template

> 项目级智能代理指令集。每个代理专注于模板开发的一个特定方面，提供标准化的工作流程和检查清单。
>
> A collection of project-specific AI agent instructions. Each agent focuses on one aspect of template development with standardized workflows and checklists.

## 总览 / Overview

本模板的代理按 **职责维度** 和 **代码目录** 两个维度组织。职责维度的代理覆盖通用开发流程，目录维度的代理聚焦特定代码目录的具体规则。

Agents are organized by two dimensions: **responsibility** (general workflow agents) and **code directory** (directory-specific agents for focused rules).

## 一、职责维度代理 / Responsibility Agents

| Agent | 职责 | Focus |
|-------|------|-------|
| [Code Writing](agents/code-writing.md) | 特性开发、组件编写、模块实现 | Feature implementation |
| [Code Review](agents/code-review.md) | PR 审查、代码质量、最佳实践 | Pull request & quality review |
| [Project Audit](agents/project-audit.md) | 健康检查、技术债务、一致性验证 | Health check & consistency |
| [Architecture Review](agents/architecture-review.md) | 架构决策、模块设计、数据流 | Architecture decisions & design |
| [Testing](agents/testing.md) | 测试策略、用例编写、覆盖率 | Test strategy & coverage |
| [Documentation](agents/documentation.md) | 文档维护、i18n、VitePress 同步 | Docs & i18n maintenance |
| [Dependency Management](agents/dependency-management.md) | 依赖升级、兼容性、安全审计 | Upgrades & compatibility |
| [Migration & Init](agents/migration.md) | 数据库迁移、种子数据、初始化流程 | DB migration & seed data |

## 二、目录维度代理 / Directory Agents

| Agent | 聚焦目录 | Focus Directory |
|-------|---------|-----------------|
| [App Layer](agents/app-layer.md) | `app/` — Pages, Components, Composables, Layouts | Frontend application layer |
| [Server Layer](agents/server-layer.md) | `server/` — API, Middleware, Services, Utils | Backend & API layer |
| [Drizzle / Database](agents/drizzle-layer.md) | `app/drizzle/` + `server/utils/init-system.ts` | Database schema & ORM |
| [Config & Scripts](agents/config-layer.md) | `scripts/`, Config files, CI/CD | Init scripts, deploy, config |
| [i18n / Locales](agents/i18n-layer.md) | `i18n/` — en/zh-CN translation files | Internationalization |

## 使用方式 / Usage

Each agent document follows the same structure:

1. **Role & Scope** — 谁、做什么
2. **Workflow** — 标准操作步骤
3. **Checklist** — 必须验证的事项
4. **Rules** — 约束与准则（部分代理没有独立 Rules，规则内嵌在 Workflow 中）

To invoke an agent, reference its document file in context:

```
请按照 agents/code-review.md 审查当前变更
请按照 agents/app-layer.md 为这个新页面创建前端组件
请按照 agents/i18n-layer.md 确保所有新增文本的国际化 key 已添加
请按照 agents/drizzle-layer.md 设计这个新功能的数据表
```

## 代理间协作 / Agent Collaboration

不同维度的代理可以组合使用。例如新增一个功能模块时，先调用 `code-writing.md` 规划整体，再依次调用 `drizzle-layer.md`（数据库）、`server-layer.md`（API）、`app-layer.md`（前端）、`i18n-layer.md`（国际化）、`testing.md`（测试）。

When adding a new feature, chain agents in order: DB → API → Frontend → i18n → Tests.

## Principles

- **Bilingual**: All agent docs are in Chinese (primary) with English annotations
- **Practical**: Agents produce concrete outputs, not vague suggestions
- **Context-aware**: Each agent reads the relevant codebase context before acting
- **Verifiable**: Every agent has a checklist to confirm completion
