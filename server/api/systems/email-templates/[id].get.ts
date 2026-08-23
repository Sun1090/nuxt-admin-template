import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { emailTemplates } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, id))
      .limit(1)

    if (!template) {
      throw createError({ statusCode: 404, message: '邮件模板不存在' })
    }

    return { data: template }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '获取邮件模板失败',
    })
  }
})
