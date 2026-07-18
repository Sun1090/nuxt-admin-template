import { relations } from 'drizzle-orm'
import { boolean, integer, jsonb, pgEnum, pgTable, primaryKey, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

// 枚举定义
export const statusEnum = pgEnum('status', ['active', 'inactive', 'suspended'])

// 角色表
export const roles = pgTable('Role', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text('name').notNull(),
  remark: varchar('remark'),
  is_superadmin: boolean('is_superadmin').default(false).notNull(),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
})

// 用户表
export const users = pgTable('User', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  name: text('name'),
  email: text('email'),
  phone: text('phone'),
  avatar: text('avatar'),
  role_id: uuid('role_id').references(() => roles.id),
  last_login: timestamp('last_login'),
  lastLoginIp: text('lastLoginIp'),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  passwordChangedAt: timestamp('passwordChangedAt'),
  forcePasswordChange: boolean('forcePasswordChange').default(true).notNull(),
  status: statusEnum('status').default('active').notNull(),
  statusChangedAt: timestamp('statusChangedAt').defaultNow(),
  statusChangedBy: integer('statusChangedBy'),
})

// 权限表
export const permissions = pgTable('Permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  remark: varchar('remark'),
  category: varchar('category', { length: 20 }),
  resource: varchar('resource', { length: 50 }),
  action: varchar('action', { length: 20 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// 角色权限关联表
export const rolePermissions = pgTable(
  'Role_Permissions',
  {
    roleId: uuid('role_id').notNull().references(() => roles.id),
    permissionId: uuid('permission_id').notNull().references(() => permissions.id),
  },
  table => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  }),
)

// 系统设置表
export const systemSettings = pgTable('SystemSettings', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  enablePlayTimeSelection: boolean('enablePlayTimeSelection').default(false).notNull(),
  siteTitle: text('siteTitle'),
  siteLogoUrl: text('siteLogoUrl'),
})

// 通知表
export const notifications = pgTable('Notification', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  type: text('type').notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  userId: integer('userId').notNull().references(() => users.id),
})

// 通知设置表
export const notificationSettings = pgTable('NotificationSettings', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  userId: integer('userId').notNull().references(() => users.id).unique(),
  enabled: boolean('enabled').default(true).notNull(),
})

// API Keys表
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  remark: text('remark'),
  keyHash: varchar('key_hash', { length: 255 }).notNull().unique(),
  keyPrefix: varchar('key_prefix', { length: 10 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdByUserId: integer('created_by_user_id').notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
})

// API Key权限表
export const apiKeyPermissions = pgTable('api_key_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  apiKeyId: uuid('api_key_id').notNull(),
  permission: varchar('permission').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// API访问日志表
export const apiLogs = pgTable('api_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  apiKeyId: uuid('api_key_id'),
  endpoint: varchar('endpoint', { length: 500 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent'),
  statusCode: integer('status_code').notNull(),
  responseTimeMs: integer('response_time_ms').notNull(),
  requestBody: text('request_body'),
  responseBody: text('response_body'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  errorMessage: text('error_message'),
})

// 用户状态变更日志表
export const userStatusLogs = pgTable('user_status_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  oldStatus: statusEnum('old_status'),
  newStatus: statusEnum('new_status').notNull(),
  reason: text('reason'),
  operatorId: integer('operator_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 邮件模板表
export const emailTemplates = pgTable('EmailTemplate', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  key: varchar('key').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  subject: varchar('subject', { length: 300 }).notNull(),
  html: text('html').notNull(),
  updatedByUserId: integer('updatedByUserId'),
})

// 关系定义
export const usersRelations = relations(users, ({ many, one }) => ({
  notifications: many(notifications),
  notificationSettings: one(notificationSettings, {
    fields: [users.id],
    references: [notificationSettings.userId],
  }),
  apiKeys: many(apiKeys),
  statusLogs: many(userStatusLogs),
  statusChangedByUser: one(users, {
    fields: [users.statusChangedBy],
    references: [users.id],
  }),
}))

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
  users: many(users),
}))

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}))

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}))

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  user: one(users, {
    fields: [notificationSettings.userId],
    references: [users.id],
  }),
}))

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [apiKeys.createdByUserId],
    references: [users.id],
  }),
  permissions: many(apiKeyPermissions),
  logs: many(apiLogs),
}))

export const apiKeyPermissionsRelations = relations(apiKeyPermissions, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [apiKeyPermissions.apiKeyId],
    references: [apiKeys.id],
  }),
}))

export const apiLogsRelations = relations(apiLogs, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [apiLogs.apiKeyId],
    references: [apiKeys.id],
  }),
}))

export const userStatusLogsRelations = relations(userStatusLogs, ({ one }) => ({
  user: one(users, {
    fields: [userStatusLogs.userId],
    references: [users.id],
  }),
  operator: one(users, {
    fields: [userStatusLogs.operatorId],
    references: [users.id],
  }),
}))

// 导出所有表的类型
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert
export type Permission = typeof permissions.$inferSelect
export type NewPermission = typeof permissions.$inferInsert
export type RolePermission = typeof rolePermissions.$inferSelect
export type NewRolePermission = typeof rolePermissions.$inferInsert
export type SystemSettings = typeof systemSettings.$inferSelect
export type NewSystemSettings = typeof systemSettings.$inferInsert
export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
export type NotificationSettings = typeof notificationSettings.$inferSelect
export type NewNotificationSettings = typeof notificationSettings.$inferInsert
export type ApiKey = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert
export type ApiKeyPermission = typeof apiKeyPermissions.$inferSelect
export type NewApiKeyPermission = typeof apiKeyPermissions.$inferInsert
export type ApiLog = typeof apiLogs.$inferSelect
export type NewApiLog = typeof apiLogs.$inferInsert
export type UserStatusLog = typeof userStatusLogs.$inferSelect
export type NewUserStatusLog = typeof userStatusLogs.$inferInsert
export type EmailTemplate = typeof emailTemplates.$inferSelect
export type NewEmailTemplate = typeof emailTemplates.$inferInsert

export type StatusEnum = 'active' | 'inactive' | 'suspended'
