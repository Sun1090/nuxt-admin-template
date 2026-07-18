import { and, count, desc, eq, gt, inArray, isNull, lt, or, sql } from 'drizzle-orm'
import { apiKeyPermissions, apiKeys, db, users } from '~/drizzle/db'

/**
 * 获取API Key列表
 * GET /api/admin/api-keys
 */
export default defineEventHandler(async (event) => {
  // 检查用户权限 - 只有超级管理员可以管理API Key
  const user = event.context.user
  if (!user || user.roleName !== '超级管理员') {
    throw createError({
      statusCode: 403,
      message: '只有超级管理员可以管理API Key',
    })
  }

  const query = getQuery(event)
  console.log('查询参数:', query) // 调试日志

  const page = Number.parseInt(query.page as string) || 1
  const pageSize = Number.parseInt(query.pageSize as string) || 20
  const name = query.name as string || '' // 修复：使用 name 而不是 search
  const status = query.status as string || 'all' // 添加默认值

  const offset = (page - 1) * pageSize

  try {
    // 构建查询条件
    const whereConditions = []

    // 名称筛选 - 修复：使用 name 参数
    if (name && name.trim()) {
      whereConditions.push(
        sql`${apiKeys.name} ILIKE ${`%${name.trim()}%`}`,
      )
    }

    // 状态筛选 - 修复状态条件
    if (status && status !== 'all') {
      if (status === 'active') {
        // 活跃：isActive = true 且 (expiresAt 为 null 或 expiresAt > 当前时间)
        whereConditions.push(
          and(
            eq(apiKeys.isActive, true),
            or(
              isNull(apiKeys.expiresAt),
              gt(apiKeys.expiresAt, new Date()),
            ),
          ),
        )
      }
      else if (status === 'inactive') {
        // 未激活：isActive = false
        whereConditions.push(eq(apiKeys.isActive, false))
      }
      else if (status === 'expired') {
        // 已过期：isActive = true 且 expiresAt <= 当前时间
        whereConditions.push(
          and(
            eq(apiKeys.isActive, true),
            lt(apiKeys.expiresAt, new Date()),
          ),
        )
      }
    }

    // 构建最终的 where 条件
    const whereClause = whereConditions.length > 0
      ? and(...whereConditions)
      : undefined

    console.log('构建的查询条件:', whereConditions) // 调试日志

    // 获取API Key列表
    const apiKeysList = await db
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
        createdByUserId: apiKeys.createdByUserId,
        creatorName: users.username,
      })
      .from(apiKeys)
      .leftJoin(users, eq(apiKeys.createdByUserId, users.id))
      .where(whereClause)
      .orderBy(desc(apiKeys.createdAt))
      .limit(pageSize)
      .offset(offset)

    console.log('查询结果数量:', apiKeysList.length) // 调试日志

    // 获取总数
    const totalResult = await db
      .select({ count: count() })
      .from(apiKeys)
      .where(whereClause)

    const total = totalResult[0]?.count || 0

    // 获取每个API Key的权限
    const apiKeyIds = apiKeysList.map(key => key.id).filter(id => id != null)
    let permissions = []
    if (apiKeyIds.length > 0) {
      try {
        permissions = await db
          .select({
            apiKeyId: apiKeyPermissions.apiKeyId,
            permission: apiKeyPermissions.permission,
          })
          .from(apiKeyPermissions)
          .where(inArray(apiKeyPermissions.apiKeyId, apiKeyIds))
      }
      catch (permError) {
        console.error('获取权限数据失败:', permError)
        permissions = []
      }
    }

    // 组织权限数据
    const permissionsMap: Record<string, string[]> = {}
    for (const perm of permissions) {
      const apiKeyId = String(perm.apiKeyId)
      if (!permissionsMap[apiKeyId]) {
        permissionsMap[apiKeyId] = []
      }
      permissionsMap[apiKeyId].push(perm.permission)
    }

    // 组合结果
    const result = apiKeysList.map((key) => {
      const keyId = String(key.id)
      const expiresAt = key.expiresAt ? new Date(key.expiresAt) : null
      const now = new Date()

      return {
        ...key,
        permissions: permissionsMap[keyId] || [],
        isExpired: expiresAt ? now > expiresAt : false,
        status: !key.isActive
          ? 'inactive'
          : (expiresAt && now > expiresAt)
              ? 'expired'
              : 'active',
      }
    })

    return {
      success: true,
      data: result,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }
  catch (error: any) {
    console.error('获取API Key列表失败:', error)
    throw createError({
      statusCode: 500,
      message: `获取API Key列表失败: ${error.message}`,
    })
  }
})
