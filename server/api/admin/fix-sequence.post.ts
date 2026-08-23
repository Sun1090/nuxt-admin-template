import { sql } from 'drizzle-orm'
import { db } from '~/drizzle/db'

// 数据表名 -> 序列名映射
const TABLE_SEQUENCES: Record<string, string> = {
  User: 'User_id_seq',
  Role: 'Role_id_seq',
  SystemSettings: 'SystemSettings_id_seq',
  user_status_logs: 'user_status_logs_id_seq',
  EmailTemplate: 'EmailTemplate_id_seq',
}

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user?.is_superadmin) {
    throw createError({ statusCode: 403, message: '只有超级管理员可以重置序列' })
  }

  try {
    const body = await readBody(event)
    const table = body.table

    if (!table) {
      throw createError({ statusCode: 400, message: '请选择数据表' })
    }

    if (table === 'all') {
      for (const [tableName, seqName] of Object.entries(TABLE_SEQUENCES)) {
        try {
          await db.execute(sql.raw(`SELECT setval('"${seqName}"', COALESCE((SELECT MAX(id) FROM "${tableName}"), 1), true)`))
        }
        catch {
          // 某些表可能没有 id 列或序列，跳过
        }
      }
      return { success: true, message: '所有表的序列已重置' }
    }

    const seqName = TABLE_SEQUENCES[table]
    if (!seqName) {
      throw createError({ statusCode: 400, message: `未知的表名: ${table}` })
    }

    await db.execute(sql.raw(`SELECT setval('"${seqName}"', COALESCE((SELECT MAX(id) FROM "${table}"), 1), true)`))

    return { success: true, message: `${table} 表的序列已重置` }
  }
  catch (error: any) {
    if (error.statusCode)
      throw error
    throw createError({
      statusCode: 500,
      message: `重置序列失败: ${error.message || '未知错误'}`,
    })
  }
})
