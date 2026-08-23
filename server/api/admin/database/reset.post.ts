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
    throw createError({ statusCode: 403, message: '只有超级管理员可以重置数据库' })
  }

  try {
    // 按依赖顺序清空所有表
    await db.delete(apiLogs)
    await db.delete(apiKeyPermissions)
    await db.delete(apiKeys)
    await db.delete(emailTemplates)
    await db.delete(notificationSettings)
    await db.delete(notifications)
    await db.delete(userStatusLogs)
    await db.delete(rolePermissions)
    await db.delete(users)
    await db.delete(permissions)
    await db.delete(roles)
    await db.delete(systemSettings)

    return {
      success: true,
      message: '数据库已重置，所有数据已清空',
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `重置数据库失败: ${error.message || '未知错误'}`,
    })
  }
})
