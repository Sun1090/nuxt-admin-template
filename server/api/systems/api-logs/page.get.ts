import { and, count, desc, eq, like } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { apiKeys, apiLogs } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.is_superadmin) {
      throw createError({ statusCode: 403, message: '没有权限查看API日志' })
    }

    const query = getQuery(event)
    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 20
    const endpoint = query.endpoint as string || ''
    const statusCode = query.statusCode as string || ''
    const method = query.method as string || ''

    const conditions = []
    if (endpoint)
      conditions.push(like(apiLogs.endpoint, `%${endpoint}%`))
    if (statusCode)
      conditions.push(eq(apiLogs.statusCode, Number(statusCode)))
    if (method)
      conditions.push(eq(apiLogs.method, method.toUpperCase()))

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [totalResult] = await db
      .select({ total: count() })
      .from(apiLogs)
      .where(where)

    const total = Number(totalResult?.total || 0)

    const logs = await db
      .select({
        id: apiLogs.id,
        apiKeyId: apiLogs.apiKeyId,
        endpoint: apiLogs.endpoint,
        method: apiLogs.method,
        statusCode: apiLogs.statusCode,
        responseTimeMs: apiLogs.responseTimeMs,
        ipAddress: apiLogs.ipAddress,
        createdAt: apiLogs.createdAt,
        errorMessage: apiLogs.errorMessage,
        apiKeyName: apiKeys.name,
      })
      .from(apiLogs)
      .leftJoin(apiKeys, eq(apiLogs.apiKeyId, apiKeys.id))
      .where(where)
      .orderBy(desc(apiLogs.createdAt))
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
      message: error.message || '获取API日志失败',
    })
  }
})
