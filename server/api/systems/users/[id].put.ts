import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { users, userStatusLogs } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:user.update')) {
      throw createError({ statusCode: 403, message: '没有权限更新用户数据' })
    }
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      throw createError({ statusCode: 400, message: '用户ID不能为空' })
    }

    const userId = Number(id)
    if (Number.isNaN(userId)) {
      throw createError({ statusCode: 400, message: '用户ID格式不正确' })
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then(result => result[0])

    if (!existingUser) {
      throw createError({ statusCode: 404, message: '用户不存在' })
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.role_id !== undefined)
      updateData.role_id = body.role_id
    if (body.status !== undefined)
      updateData.status = body.status
    if (body.name !== undefined)
      updateData.name = body.name?.trim() || null
    if (body.forcePasswordChange !== undefined)
      updateData.forcePasswordChange = Boolean(body.forcePasswordChange)
    if (body.email !== undefined)
      updateData.email = body.email || null
    if (body.phone !== undefined)
      updateData.phone = body.phone || null
    if (body.avatar !== undefined)
      updateData.avatar = body.avatar || null

    // 记录状态变更
    if (body.status && body.status !== existingUser.status) {
      await db.insert(userStatusLogs).values({
        userId,
        oldStatus: existingUser.status,
        newStatus: body.status,
        operatorId: event.context.user?.id ? Number(event.context.user.id) : null,
        reason: body.reason || '管理员修改',
        created_at: new Date(),
      })
    }

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning()

    if (!result || result.length === 0) {
      throw new Error('用户更新失败，未返回结果')
    }

    return {
      success: true,
      message: '用户更新成功',
      data: { ...result[0], password: undefined },
    }
  }
  catch (error: any) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, message: '用户名已存在' })
    }
    if (error.code === '23503' && error.constraint?.includes('role_id')) {
      throw createError({ statusCode: 400, message: '选择的角色不存在' })
    }
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, message: `更新用户失败: ${error.message || '未知错误'}` })
  }
})
