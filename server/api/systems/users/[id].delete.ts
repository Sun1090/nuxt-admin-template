import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { users } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:user.delete')) {
      throw createError({ statusCode: 401, message: '没有权限删除用户数据' })
    }
    try {
      const id = getRouterParam(event, 'id')
      console.log('删除用户 ID:', id)

      if (!id) {
        throw createError({
          statusCode: 400,
          message: '用户ID不能为空',
        })
      }

      const userId = Number(id)
      console.log('转换后的用户ID:', userId)

      if (Number.isNaN(userId)) {
        throw createError({
          statusCode: 400,
          message: '无效的用户ID格式',
        })
      }

      // 简单删除，让数据库处理约束
      const result = await db.delete(users)
        .where(eq(users.id, userId))
        .returning()

      console.log('删除结果:', result)

      if (result.length === 0) {
        throw createError({
          statusCode: 404,
          message: '用户不存在或已被删除',
        })
      }

      return {
        success: true,
        message: '用户删除成功',
        data: { id: userId },
      }
    }
    catch (error: any) {
      console.error('删除用户完整错误:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack,
      })

      // 处理特定错误
      if (error.message?.includes('foreign key')) {
        throw createError({
          statusCode: 409,
          message: '该用户有关联数据，无法直接删除',
        })
      }

      if (error.message?.includes('violates foreign key')) {
        throw createError({
          statusCode: 409,
          message: '该用户有关联数据，请先删除相关数据',
        })
      }

      throw createError({
        statusCode: error.statusCode || 500,
        message: error.message || '删除用户失败',
      })
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || '获取用户信息失败',
    })
  }
})
