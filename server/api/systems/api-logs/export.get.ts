import { and, desc, eq, like } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { apiKeys, apiLogs } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.is_superadmin) {
      throw createError({ statusCode: 403, message: '没有权限导出API日志' })
    }

    const query = getQuery(event)
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

    const logs = await db
      .select({
        id: apiLogs.id,
        apiKeyName: apiKeys.name,
        apiKeyId: apiLogs.apiKeyId,
        endpoint: apiLogs.endpoint,
        method: apiLogs.method,
        statusCode: apiLogs.statusCode,
        responseTimeMs: apiLogs.responseTimeMs,
        ipAddress: apiLogs.ipAddress,
        createdAt: apiLogs.createdAt,
        errorMessage: apiLogs.errorMessage,
      })
      .from(apiLogs)
      .leftJoin(apiKeys, eq(apiLogs.apiKeyId, apiKeys.id))
      .where(where)
      .orderBy(desc(apiLogs.createdAt))

    const headers = ['ID', 'API Key', 'Method', 'Endpoint', 'Status', 'Response Time (ms)', 'IP', 'Error', 'Time']
    const rows = logs.map(log => [
      log.id,
      log.apiKeyName || '-',
      log.method,
      log.endpoint,
      log.statusCode,
      log.responseTimeMs,
      log.ipAddress,
      log.errorMessage || '',
      log.createdAt ? new Date(log.createdAt).toISOString() : '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

    const csv = `\uFEFF${headers.join(',')}\n${rows.join('\n')}`

    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', `attachment; filename="api-logs-${Date.now()}.csv"`)
    return csv
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '导出API日志失败',
    })
  }
})
