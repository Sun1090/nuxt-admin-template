import { ApiLogService } from '~~/server/services/apiLogService'

/**
 * 获取API访问日志
 * GET /api/admin/api-keys/logs
 */
export default defineEventHandler(async (event) => {
  // 检查用户权限 - 只有超级管理员可以查看API日志
  const user = event.context.user
  if (!user || user.roleName !== '超级管理员') {
    throw createError({
      statusCode: 403,
      message: '只有超级管理员可以查看API日志',
    })
  }

  const query = getQuery(event)
  const page = Number.parseInt(query.page as string) || 1
  const limit = Number.parseInt(query.limit as string) || 50
  const apiKeyId = query.apiKeyId as string
  const endpoint = query.endpoint as string
  const method = query.method as string
  const statusCode = query.statusCode ? Number.parseInt(query.statusCode as string) : undefined
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const ipAddress = query.ipAddress as string
  const sortBy = query.sortBy as string || 'createdAt'
  const sortOrder = query.sortOrder as string || 'desc'

  const offset = (page - 1) * limit

  try {
    // 使用ApiLogService获取日志
    const result = await ApiLogService.getLogs({
      apiKeyId,
      endpoint,
      method: method?.toUpperCase(),
      statusCode,
      ipAddress,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit,
      sortBy,
      sortOrder,
    })

    // 获取统计信息
    const stats = await ApiLogService.getStats({
      apiKeyId,
      endpoint,
      method: method?.toUpperCase(),
      statusCode,
      ipAddress,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })

    return {
      logs: result.logs,
      pagination: result.pagination,
      stats: stats.basic,
    }
  }
  catch (error) {
    console.error('获取API访问日志失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取API访问日志失败',
    })
  }
})
