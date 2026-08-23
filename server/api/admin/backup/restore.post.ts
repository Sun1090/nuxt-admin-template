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
    throw createError({ statusCode: 403, message: '只有超级管理员可以恢复数据库' })
  }

  try {
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw createError({ statusCode: 400, message: '请上传备份文件' })
    }

    const file = formData.find(f => f.name === 'file')
    if (!file) {
      throw createError({ statusCode: 400, message: '未找到备份文件' })
    }

    const mode = (formData.find(f => f.name === 'mode')?.data?.toString() || 'merge') as string
    const clearExisting = formData.find(f => f.name === 'clearExisting')?.data?.toString() === 'true'

    let backupData: Record<string, any[]>
    try {
      backupData = JSON.parse(file.data.toString())
    }
    catch {
      throw createError({ statusCode: 400, message: '无效的JSON备份文件' })
    }

    const tablesProcessed: string[] = []
    const recordsRestored: number[] = []
    const errors: string[] = []

    if (mode === 'replace' && clearExisting) {
      // 按依赖顺序清空
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
    }

    // 按依赖顺序恢复
    if (backupData.roles) {
      try {
        for (const row of backupData.roles) {
          await db.insert(roles).values(row).onConflictDoNothing()
        }
        tablesProcessed.push('roles')
        recordsRestored.push(backupData.roles.length)
      }
      catch (e: any) { errors.push(`roles: ${e.message}`) }
    }

    if (backupData.permissions) {
      try {
        for (const row of backupData.permissions) {
          await db.insert(permissions).values(row).onConflictDoNothing()
        }
        tablesProcessed.push('permissions')
        recordsRestored.push(backupData.permissions.length)
      }
      catch (e: any) { errors.push(`permissions: ${e.message}`) }
    }

    if (backupData.users) {
      try {
        for (const row of backupData.users) {
          await db.insert(users).values(row).onConflictDoNothing()
        }
        tablesProcessed.push('users')
        recordsRestored.push(backupData.users.length)
      }
      catch (e: any) { errors.push(`users: ${e.message}`) }
    }

    if (backupData.rolePermissions) {
      try {
        for (const row of backupData.rolePermissions) {
          await db.insert(rolePermissions).values(row).onConflictDoNothing()
        }
        tablesProcessed.push('rolePermissions')
        recordsRestored.push(backupData.rolePermissions.length)
      }
      catch (e: any) { errors.push(`rolePermissions: ${e.message}`) }
    }

    if (backupData.systemSettings) {
      try {
        for (const row of backupData.systemSettings) {
          await db.insert(systemSettings).values(row).onConflictDoNothing()
        }
        tablesProcessed.push('systemSettings')
        recordsRestored.push(backupData.systemSettings.length)
      }
      catch (e: any) { errors.push(`systemSettings: ${e.message}`) }
    }

    if (backupData.emailTemplates) {
      try {
        for (const row of backupData.emailTemplates) {
          await db.insert(emailTemplates).values(row).onConflictDoNothing()
        }
        tablesProcessed.push('emailTemplates')
        recordsRestored.push(backupData.emailTemplates.length)
      }
      catch (e: any) { errors.push(`emailTemplates: ${e.message}`) }
    }

    return {
      success: true,
      message: '数据恢复成功',
      details: {
        tablesProcessed: tablesProcessed.length,
        recordsRestored: recordsRestored.reduce((a, b) => a + b, 0),
        errors,
      },
    }
  }
  catch (error: any) {
    if (error.statusCode)
      throw error
    throw createError({
      statusCode: 500,
      message: `恢复备份失败: ${error.message || '未知错误'}`,
    })
  }
})
