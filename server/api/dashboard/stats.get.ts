import { count, eq } from 'drizzle-orm'
import { db, permissions, roles, users } from '~/drizzle/db'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('page:overview')) {
      throw createError({ statusCode: 403, message: '没有权限访问仪表盘' })
    }

    const [userCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.status, 'active'))

    const [roleCount] = await db
      .select({ count: count() })
      .from(roles)

    const [permissionCount] = await db
      .select({ count: count() })
      .from(permissions)

    const [activeUserCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.status, 'active'))

    return {
      totalUsers: userCount.count,
      activeUsers: activeUserCount.count,
      totalRoles: roleCount.count,
      totalPermissions: permissionCount.count,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '获取统计数据失败',
    })
  }
})
