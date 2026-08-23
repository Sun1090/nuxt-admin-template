import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { notificationSettings } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({ statusCode: 401, message: '未登录' })
    }

    const body = await readBody(event)
    const enabled = body.enabled !== undefined ? Boolean(body.enabled) : true

    // upsert: update if exists, insert if not
    const existing = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, user.id))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(notificationSettings)
        .set({
          enabled,
          updatedAt: new Date(),
        })
        .where(eq(notificationSettings.userId, user.id))
    }
    else {
      await db.insert(notificationSettings).values({
        userId: user.id,
        enabled,
      })
    }

    return { success: true, message: '通知设置已更新' }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, message: error.message || '更新通知设置失败' })
  }
})
