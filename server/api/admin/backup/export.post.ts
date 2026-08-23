import { db } from '~/drizzle/db'
import {
  apiKeyPermissions,
  apiKeys,
  apiLogs,
  emailTemplates,
  notifications,
  notificationSettings,
  permissions,
  rolePermissions,
  roles,
  systemSettings,
  users,
  userStatusLogs,
} from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user?.is_superadmin) {
    throw createError({ statusCode: 403, message: '只有超级管理员可以备份数据库' })
  }

  try {
    const body = await readBody(event).catch(() => ({}))
    const tables = body.tables || 'all'
    const includeSystemData = body.includeSystemData !== false

    const backup: Record<string, any> = {}

    if (tables === 'all' || tables === 'users') {
      backup.users = await db.select().from(users)
      if (includeSystemData) {
        backup.userStatusLogs = await db.select().from(userStatusLogs)
      }
    }
    if (tables === 'all' || tables === 'roles') {
      backup.roles = await db.select().from(roles)
      backup.rolePermissions = await db.select().from(rolePermissions)
    }
    if (tables === 'all') {
      backup.permissions = await db.select().from(permissions)
    }
    if (includeSystemData && tables === 'all') {
      backup.systemSettings = await db.select().from(systemSettings)
      backup.notifications = await db.select().from(notifications)
      backup.notificationSettings = await db.select().from(notificationSettings)
      backup.emailTemplates = await db.select().from(emailTemplates)
      backup.apiKeys = await db.select().from(apiKeys)
      backup.apiKeyPermissions = await db.select().from(apiKeyPermissions)
      backup.apiLogs = await db.select().from(apiLogs)
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup-${timestamp}.json`

    return {
      success: true,
      backup: {
        downloadMode: 'direct',
        data: backup,
        filename,
        size: JSON.stringify(backup).length,
      },
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `备份创建失败: ${error.message || '未知错误'}`,
    })
  }
})
