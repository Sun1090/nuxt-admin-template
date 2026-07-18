import { inArray } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { users } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:user.reset_password')) {
      throw createError({ statusCode: 401, message: '没有权限更新用户数据' })
    }
    const body = await readBody(event)

    if (!body.userIds || !body.userIds.length || !body.newPassword) {
      throw createError({
        statusCode: 400,
        message: '用户ID列表和新密码为必填项',
      })
    }

    // 加密密码
    const hashedPassword = await hashPassword(body.newPassword)

    // 批量重置密码
    const result = await db.update(users)
      .set({
        password: hashedPassword,
        forcePasswordChange: true,
        passwordChangedAt: null,
        updated_at: new Date().toISOString(),
      })
      .where(inArray(users.id, body.userIds))

    return {
      message: `成功重置 ${body.userIds.length} 个用户的密码`,
      updatedCount: result.count,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.statusMessage || '批量重置密码失败',
    })
  }
})
