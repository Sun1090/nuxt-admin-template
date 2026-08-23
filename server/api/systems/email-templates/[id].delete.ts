import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { emailTemplates } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.is_superadmin) {
      throw createError({ statusCode: 403, message: '没有权限管理邮件模板' })
    }

    const id = Number(getRouterParam(event, 'id'))

    const [deleted] = await db
      .delete(emailTemplates)
      .where(eq(emailTemplates.id, id))
      .returning()

    if (!deleted) {
      throw createError({ statusCode: 404, message: '邮件模板不存在' })
    }

    return { message: '删除成功' }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '删除邮件模板失败',
    })
  }
})
