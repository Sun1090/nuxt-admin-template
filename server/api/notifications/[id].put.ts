import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { notifications } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({ statusCode: 401, message: '未登录' })
    }

    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: '缺少通知ID' })
    }

    const body = await readBody(event)
    const read = body.read !== undefined ? Boolean(body.read) : true

    await db
      .update(notifications)
      .set({ read })
      .where(eq(notifications.id, id))

    return { success: true }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '更新通知失败',
    })
  }
})
