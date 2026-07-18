import { eq, sql } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { users, userStatusLogs } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:user.create')) {
      throw createError({ statusCode: 403, message: '没有权限创建用户' })
    }
    const body = await readBody(event)

    if (!body.username?.trim()) {
      throw createError({ statusCode: 400, message: '用户名不能为空' })
    }
    if (!body.password) {
      throw createError({ statusCode: 400, message: '密码不能为空' })
    }
    if (!body.role_id) {
      throw createError({ statusCode: 400, message: '请选择用户角色' })
    }

    // 检查用户名是否已存在
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, body.username.trim()))
      .limit(1)

    if (existingUser.length > 0) {
      throw createError({ statusCode: 409, message: '用户名已存在' })
    }

    const hashedPassword = await hashPassword(body.password)

    const userData: any = {
      username: body.username.trim(),
      password: hashedPassword,
      name: body.name?.trim() || null,
      email: body.email || null,
      phone: body.phone || null,
      avatar: body.avatar || null,
      role_id: body.role_id,
      status: body.status || 'active',
      forcePasswordChange: body.forcePasswordChange !== false,
      created_at: sql`now()`,
      updated_at: sql`now()`,
    }

    const result = await db.insert(users).values(userData).returning()
    if (!result || result.length === 0) {
      throw new Error('用户创建失败，未返回结果')
    }

    const userInfo = result[0]

    // 记录状态变更日志
    try {
      await db.insert(userStatusLogs).values({
        userId: userInfo.id,
        oldStatus: null,
        newStatus: userInfo.status,
        operatorId: event.context.user?.id ? Number(event.context.user.id) : null,
        reason: '用户创建',
        created_at: sql`now()`,
      })
    }
    catch {
      // 日志写入失败不影响用户创建
    }

    return {
      success: true,
      message: '用户创建成功',
      data: { ...userInfo, password: undefined },
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
    throw createError({ statusCode: 500, message: `创建用户失败: ${error.message || '未知错误'}` })
  }
})
