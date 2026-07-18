import crypto from 'node:crypto'
import { z } from 'zod'
import { apiKeyPermissions, apiKeys, db } from '~/drizzle/db'
import { getBeijingTime } from '~/utils/timeUtils'

/**
 * 创建API Key
 * POST /api/admin/api-keys
 */

// 请求体验证schema
const createApiKeySchema = z.object({
  name: z.string().min(1, 'API Key名称不能为空').max(100, 'API Key名称不能超过100个字符'),
  remark: z.string().max(500, '描述不能超过500个字符').optional().nullable().default(null),
  expiresAt: z.union([
    z.string(),
    z.null(),
    z.undefined(),
  ]).optional(),
  permissions: z.array(z.enum(['users:read', 'users:write', 'roles:read', 'roles:write', 'analytics:read'])).min(1, '至少需要选择一个权限').optional(),
})

export default defineEventHandler(async (event) => {
  // 检查用户权限 - 只有超级管理员可以管理API Key
  const user = event.context.user
  if (!user || user.roleName !== '超级管理员') {
    throw createError({
      statusCode: 403,
      message: '只有超级管理员可以管理API Key',
    })
  }

  try {
    // 验证请求体
    const body = await readBody(event)
    console.log('接收到的请求体:', body)

    const validatedData = createApiKeySchema.parse(body)
    console.log('验证后的数据:', validatedData)

    // 生成API Key
    const apiKey = generateApiKey()
    const keyPrefix = apiKey.substring(0, 10)
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')

    // 处理过期时间
    let expiresAt: Date | null = null
    if (validatedData.expiresAt && typeof validatedData.expiresAt === 'string' && validatedData.expiresAt.trim() !== '') {
      try {
        if (validatedData.expiresAt.match(/^\d+d$/)) {
          const days = Number.parseInt(validatedData.expiresAt.replace('d', ''))
          expiresAt = getBeijingTime()
          expiresAt.setDate(expiresAt.getDate() + days)
        }
        else {
          expiresAt = new Date(validatedData.expiresAt)
          if (Number.isNaN(expiresAt.getTime())) {
            throw createError({
              statusCode: 400,
              message: '无效的过期时间格式',
            })
          }
          if (expiresAt <= getBeijingTime()) {
            throw createError({
              statusCode: 400,
              message: '过期时间不能是过去的时间',
            })
          }
        }
      }
      catch (error: any) {
        if (error.statusCode) {
          throw error
        }
        throw createError({
          statusCode: 400,
          message: '无效的过期时间格式',
        })
      }
    }

    // 开始事务 - 关键修复：让数据库自动生成时间戳
    const result = await db.transaction(async (tx) => {
      // 插入API Key记录 - 移除手动设置的 createdAt，让数据库自动生成
      const apiKeyResult = await tx.insert(apiKeys).values({
        name: validatedData.name,
        remark: validatedData.remark?.trim() || null,
        keyPrefix,
        keyHash,
        isActive: true,
        expiresAt,
        // 移除这行：createdAt: getBeijingTime(), 让数据库自动设置
        usageCount: 0,
        createdByUserId: user.id,
      }).returning({
        id: apiKeys.id,
        createdAt: apiKeys.createdAt, // 返回数据库生成的创建时间
      })

      const apiKeyId = apiKeyResult[0].id
      const createdAt = apiKeyResult[0].createdAt

      // 插入权限记录
      const permissionValues = (validatedData.permissions || []).map(permission => ({
        apiKeyId,
        permission,
      }))

      await tx.insert(apiKeyPermissions).values(permissionValues)

      return {
        id: apiKeyId,
        apiKey,
        name: validatedData.name,
        remark: validatedData.remark,
        keyPrefix,
        isActive: true,
        expiresAt,
        createdAt, // 使用数据库返回的创建时间
        permissions: validatedData.permissions || [],
        usageCount: 0,
        createdBy: user.id,
        creatorName: user.name,
      }
    })

    console.log('创建成功，返回结果:', result)

    return {
      success: true,
      message: 'API Key创建成功',
      data: result,
    }
  }
  catch (error: any) {
    // 错误处理保持不变
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: `请求参数验证失败: ${error?.errors?.map((e: any) => e.message).join(', ')}`,
      })
    }

    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      throw error
    }

    console.error('创建API Key失败:', error)
    throw createError({
      statusCode: 500,
      message: `创建API Key失败: ${error.message || '未知错误'}`,
    })
  }
})

/**
 * 生成API Key
 */
function generateApiKey(): string {
  const prefix = 'vhub_'
  const randomBytes = crypto.randomBytes(16).toString('hex')
  return prefix + randomBytes
}
