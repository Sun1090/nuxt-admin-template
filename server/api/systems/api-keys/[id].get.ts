import { eq } from 'drizzle-orm'
import { apiKeyPermissions, apiKeys, db, users } from '~/drizzle/db'

/**
 * 获取API Key详情
 * GET /api/admin/api-keys/[id]
 */
export default defineEventHandler(async (event) => {
  // 检查用户权限
  const user = event.context.user
  if (!user || user.roleName !== '超级管理员') {
    throw createError({
      statusCode: 403,
      message: '只有超级管理员可以管理API Key',
    })
  }

  const apiKeyId = getRouterParam(event, 'id')
  if (!apiKeyId) {
    throw createError({
      statusCode: 400,
      message: 'API Key ID不能为空',
    })
  }

  try {
    // 获取API Key基本信息 - 添加调试
    const apiKeyResult = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        remark: apiKeys.remark,
        keyPrefix: apiKeys.keyPrefix,
        isActive: apiKeys.isActive,
        expiresAt: apiKeys.expiresAt,
        usageCount: apiKeys.usageCount,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
        updatedAt: apiKeys.updatedAt,
        createdBy: apiKeys.createdByUserId,
        creatorName: users.username,
      })
      .from(apiKeys)
      .leftJoin(users, eq(apiKeys.createdByUserId, users.id))
      .where(eq(apiKeys.id, apiKeyId))
      .limit(1)

    console.log('数据库查询结果:', apiKeyResult) // 调试日志

    const apiKey = apiKeyResult[0]

    if (!apiKey) {
      throw createError({
        statusCode: 404,
        message: 'API Key不存在',
      })
    }

    console.log('获取到的API Key对象:', apiKey) // 查看 createdAt 是否存在

    // 获取API Key权限
    const permissionsResult = await db
      .select({
        permission: apiKeyPermissions.permission,
      })
      .from(apiKeyPermissions)
      .where(eq(apiKeyPermissions.apiKeyId, apiKeyId))

    const permissions = permissionsResult.map(p => p.permission)

    // 计算状态
    const isExpired = apiKey.expiresAt ? new Date() > new Date(apiKey.expiresAt) : false
    const status = !apiKey.isActive
      ? 'inactive'
      : isExpired
        ? 'expired'
        : 'active'

    // 显式构建响应对象
    const responseData = {
      id: apiKey.id,
      name: apiKey.name,
      remark: apiKey.remark,
      keyPrefix: apiKey.keyPrefix,
      isActive: apiKey.isActive,
      expiresAt: apiKey.expiresAt,
      usageCount: apiKey.usageCount,
      lastUsedAt: apiKey.lastUsedAt,
      createdAt: apiKey.createdAt, // 这里应该能拿到创建时间
      updatedAt: apiKey.updatedAt,
      createdBy: apiKey.createdBy,
      creatorName: apiKey.creatorName,
      permissions,
      isExpired,
      status,
    }

    console.log('最终返回数据:', responseData) // 查看最终数据

    return {
      success: true,
      data: responseData,
    }
  }
  catch (error: any) {
    console.error('获取API Key详情失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: `获取API Key详情失败: ${error.message}`,
    })
  }
})
