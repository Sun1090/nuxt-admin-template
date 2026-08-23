import { count, desc, eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { users, userStatusLogs } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.is_superadmin) {
      throw createError({ statusCode: 403, message: '没有权限查看状态变更日志' })
    }

    const query = getQuery(event)
    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 20

    const [totalResult] = await db
      .select({ total: count() })
      .from(userStatusLogs)

    const total = Number(totalResult?.total || 0)

    const logs = await db
      .select({
        id: userStatusLogs.id,
        userId: userStatusLogs.userId,
        oldStatus: userStatusLogs.oldStatus,
        newStatus: userStatusLogs.newStatus,
        reason: userStatusLogs.reason,
        createdAt: userStatusLogs.createdAt,
        username: users.username,
        operatorName: users.name,
      })
      .from(userStatusLogs)
      .leftJoin(users, eq(userStatusLogs.userId, users.id))
      .orderBy(desc(userStatusLogs.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    return {
      data: logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '获取状态变更日志失败',
    })
  }
})
