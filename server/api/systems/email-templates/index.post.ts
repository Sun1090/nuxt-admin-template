import { db } from '~/drizzle/db'
import { emailTemplates } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.is_superadmin) {
      throw createError({ statusCode: 403, message: '没有权限管理邮件模板' })
    }

    const body = await readBody(event)
    if (!body.key || !body.name || !body.subject || !body.html) {
      throw createError({ statusCode: 400, message: '缺少必填字段' })
    }

    const [created] = await db.insert(emailTemplates).values({
      key: body.key,
      name: body.name,
      subject: body.subject,
      html: body.html,
      updatedByUserId: user.id,
    }).returning()

    return { data: created, message: '创建成功' }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '创建邮件模板失败',
    })
  }
})
