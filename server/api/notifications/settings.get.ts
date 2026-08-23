import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { notificationSettings } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({ statusCode: 401, message: '未登录' })
    }

    const result = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, user.id))
      .limit(1)

    const settings = result[0] || { enabled: true }

    return { data: settings, code: 200 }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, message: error.message || '获取通知设置失败' })
  }
})
