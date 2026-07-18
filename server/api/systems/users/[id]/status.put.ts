import { eq, sql } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { users } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:user.update')) {
      throw createError({ statusCode: 401, message: '没有权限更新用户数据' })
    }
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        message: '用户ID不能为空',
      })
    }

    const userId = Number(id)
    if (Number.isNaN(userId)) {
      throw createError({
        statusCode: 400,
        message: '无效的用户ID',
      })
    }

    // 检查用户是否存在
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        message: '用户不存在',
      })
    }

    // 使用原始 SQL 查询
    const [updatedUser] = await db.execute(sql`
      UPDATE "User" 
      SET 
        "status" = ${body.status},
        "statusChangedAt" = CURRENT_TIMESTAMP,
        "statusChangedBy" = ${event.context.user?.id ? Number(event.context.user.id) : null},
        "updated_at" = CURRENT_TIMESTAMP
      WHERE "id" = ${userId}
      RETURNING *
    `)

    return updatedUser
  }
  catch (error: any) {
    console.error('更新用户状态失败:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: `更新用户状态失败: ${error.message || '未知错误'}`,
    })
  }
})
