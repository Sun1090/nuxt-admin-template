import { desc } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { emailTemplates } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.is_superadmin) {
      throw createError({ statusCode: 403, message: '没有权限访问邮件模板' })
    }

    const templates = await db
      .select()
      .from(emailTemplates)
      .orderBy(desc(emailTemplates.createdAt))

    return { data: templates }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '获取邮件模板失败',
    })
  }
})
