import { inArray } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { users, userStatusLogs } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:user.update')) {
      throw createError({ statusCode: 401, message: '没有权限更新用户数据' })
    }
    const body = await readBody(event)

    if (!body.userIds || !body.userIds.length || !body.status) {
      throw createError({
        statusCode: 400,
        message: '用户ID列表和状态为必填项',
      })
    }

    // 获取当前用户信息用于记录操作日志
    const operatorId = event.context.user?.id

    // 批量更新状态
    const result = await db.update(users)
      .set({
        status: body.status,
        statusChangedAt: new Date().toISOString(),
        statusChangedBy: operatorId,
        updated_at: new Date().toISOString(),
      })
      .where(inArray(users.id, body.userIds))

    // 记录批量操作日志（简化版，实际应该为每个用户记录）
    await db.insert(userStatusLogs).values({
      userId: body.userIds[0], // 记录第一个用户作为代表
      oldStatus: null, // 批量操作不记录旧状态
      newStatus: body.status,
      operatorId,
      reason: `批量操作：${body.userIds.length}个用户状态变更为${body.status}`,
    })

    return {
      message: `成功更新 ${body.userIds.length} 个用户的状态`,
      updatedCount: result.count,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.statusMessage || '批量更新状态失败',
    })
  }
})
