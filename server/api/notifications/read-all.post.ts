import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { notifications } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({ statusCode: 401, message: '未登录' })
    }

    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, user.id))

    return { success: true, message: '已全部标记为已读' }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '标记已读失败',
    })
  }
})
