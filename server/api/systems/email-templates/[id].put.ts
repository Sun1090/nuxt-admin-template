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
    const body = await readBody(event)

    const updates: any = {}
    if (body.key !== undefined)
      updates.key = body.key
    if (body.name !== undefined)
      updates.name = body.name
    if (body.subject !== undefined)
      updates.subject = body.subject
    if (body.html !== undefined)
      updates.html = body.html
    updates.updatedByUserId = user.id

    const [updated] = await db
      .update(emailTemplates)
      .set(updates)
      .where(eq(emailTemplates.id, id))
      .returning()

    if (!updated) {
      throw createError({ statusCode: 404, message: '邮件模板不存在' })
    }

    return { data: updated, message: '更新成功' }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '更新邮件模板失败',
    })
  }
})
