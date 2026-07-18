import process from 'node:process'
import bcrypt from 'bcrypt'
/**
 * 数据库清空脚本
 * 这个脚本会清空所有表的数据，但保留表结构
 */
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
  db,
} from '../app/drizzle/db.ts'

// 重置所有表的自增序列
async function resetAutoIncrementSequences() {
  const tables = [
    'Role',
    'User',
    'Permissions',
    'SystemSettings',
    'Notification',
    'NotificationSettings',
    'api_keys',
    'api_key_permissions',
    'api_logs',
    'user_status_logs',
    'EmailTemplate',
  ]

  console.log('重置自增序列...')

  for (const table of tables) {
    try {
      const sequenceName = `"${table}_id_seq"`
      await db.execute(`ALTER SEQUENCE ${sequenceName} RESTART WITH 1`)
    }
    catch (error) {
      console.warn(`重置 ${table} 表序列失败: ${error.message}`)
    }
  }
}

async function main() {
  console.log('开始清空数据库...')

  try {
    await db.delete(notifications)
    await db.delete(notificationSettings)
    await db.delete(emailTemplates)
    await db.delete(apiKeys)
    await db.delete(apiKeyPermissions)
    await db.delete(apiLogs)
    await db.delete(userStatusLogs)
    await db.delete(systemSettings)
    await db.delete(rolePermissions)
    await db.delete(permissions)
    await db.delete(roles)
    await db.delete(users)
    console.log('数据库已清空，开始重置自增序列...')

    await resetAutoIncrementSequences()

    console.log('开始创建默认超级管理员账户...')

    const hashedPassword = await bcrypt.hash('admin123', 10)

    const [admin] = await db
      .insert(users)
      .values({
        name: '超级管理员',
        username: 'admin',
        password: hashedPassword,
        forcePasswordChange: false,
      })
      .returning()

    console.log('默认超级管理员账户已创建:')
    console.log('账号名: admin')
    console.log('密码: admin123')
    console.log(`管理员ID: ${admin.id}`)

    try {
      const nextId = admin.id + 1
      await db.execute(`ALTER SEQUENCE "User_id_seq" RESTART WITH ${nextId}`)
    }
    catch (error) {
      console.warn(`调整User表序列失败: ${error.message}`)
    }

    console.log('🎉 数据库清空、初始化和序列重置全部完成!')
  }
  catch (error) {
    console.error('清空数据库时出错:', error)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
