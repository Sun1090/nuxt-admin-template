import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { notifications } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({ statusCode: 401, message: '未登录' })
    }

    const query = getQuery(event)
    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 20
    const type = query.type as string || ''
    const read = query.read as string || ''

    const conditions = [eq(notifications.userId, user.id)]
    if (type)
      conditions.push(eq(notifications.type, type))
    if (read === 'read')
      conditions.push(eq(notifications.read, true))
    if (read === 'unread')
      conditions.push(eq(notifications.read, false))

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [totalResult] = await db
      .select({ total: count() })
      .from(notifications)
      .where(where)

    const total = Number(totalResult?.total || 0)

    const data = await db
      .select()
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    return {
      data,
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
      message: error.message || '获取通知失败',
    })
  }
})
