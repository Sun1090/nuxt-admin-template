import { db } from '~/drizzle/db'
import { systemSettings } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user?.is_superadmin) {
    throw createError({ statusCode: 403, message: '只有超级管理员可以查看系统设置' })
  }

  try {
    const settingsResult = await db.select().from(systemSettings).limit(1)
    let settings: any = settingsResult[0] || null

    if (!settings) {
      const [created] = await db.insert(systemSettings).values({
        siteTitle: 'Admin',
        siteLogoUrl: '/favicon.ico',
      }).returning()
      settings = created
    }

    return { data: settings ?? null }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '获取系统设置失败',
    })
  }
})
