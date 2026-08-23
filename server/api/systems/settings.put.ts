import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { systemSettings } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user?.is_superadmin) {
    throw createError({ statusCode: 403, message: '只有超级管理员可以修改系统设置' })
  }

  try {
    const body = await readBody(event)

    // 获取现有设置
    const existing = await db.select().from(systemSettings).limit(1)
    let settings = existing[0]

    if (!settings) {
      // 不存在则创建
      const [created] = await db.insert(systemSettings).values({
        siteTitle: body.siteTitle || 'Admin',
        siteLogoUrl: body.siteLogoUrl || '/favicon.ico',
        siteDescription: body.siteDescription || null,
        icpNumber: body.icpNumber || null,
        loginBgUrl: body.loginBgUrl || null,
        enableRegistration: body.enableRegistration ?? false,
        enableCaptcha: body.enableCaptcha ?? false,
        defaultUserRole: body.defaultUserRole || null,
      }).returning()
      settings = created
    }
    else {
      // 更新
      const [updated] = await db.update(systemSettings).set({
        siteTitle: body.siteTitle,
        siteLogoUrl: body.siteLogoUrl,
        siteDescription: body.siteDescription,
        icpNumber: body.icpNumber,
        loginBgUrl: body.loginBgUrl,
        enableRegistration: body.enableRegistration,
        enableCaptcha: body.enableCaptcha,
        defaultUserRole: body.defaultUserRole,
        updatedAt: new Date(),
      }).where(eq(systemSettings.id, settings.id)).returning()
      settings = updated
    }

    return {
      success: true,
      message: '系统设置已更新',
      data: settings,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '更新系统设置失败',
    })
  }
})
