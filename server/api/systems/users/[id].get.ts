import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { roles, users } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:user.read')) {
      throw createError({ statusCode: 403, message: '没有权限查看用户数据' })
    }

    const id = Number(getRouterParam(event, 'id'))
    if (!id) {
      throw createError({ statusCode: 400, message: '无效的用户 ID' })
    }

    const userResult = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatar: users.avatar,
        role_id: users.role_id,
        role_name: roles.name,
        status: users.status,
        last_login: users.last_login,
        lastLoginIp: users.lastLoginIp,
        forcePasswordChange: users.forcePasswordChange,
        passwordChangedAt: users.passwordChangedAt,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .leftJoin(roles, eq(users.role_id, roles.id))
      .where(eq(users.id, id))
      .limit(1)

    if (!userResult[0]) {
      throw createError({ statusCode: 404, message: '用户不存在' })
    }

    return { data: userResult[0], code: 200 }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, message: error.message || '获取用户详情失败' })
  }
})
