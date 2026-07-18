import process from 'node:process'
import jwt from 'jsonwebtoken'
import { db, eq, permissions, rolePermissions, roles, users } from '~/drizzle/db'
import { executeRedisCommand, isRedisReady } from '../../utils/redis'

// JWT payload 类型定义
interface JwtPayload {
  userId: string
  roleId?: string
  roleName: string
  permissions: string[]
}

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError({
        statusCode: 401,
        message: '未提供认证令牌',
      })
    }

    // 验证JWT令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    const userId = decoded.userId

    // 优先从Redis缓存获取用户认证状态
    if (isRedisReady()) {
      const cachedUser = await executeRedisCommand(async () => {
        const client = (await import('../../utils/redis')).getRedisClient()
        if (!client)
          return null

        const cacheKey = `auth:user:${userId}`
        const userData = await client.get(cacheKey)

        if (userData) {
          console.log(`[API] 用户认证缓存命中: ${userId}`)
          return JSON.parse(userData)
        }

        return null
      })

      if (cachedUser) {
        return {
          user: cachedUser,
          valid: true,
        }
      }
    }

    // 缓存未命中或Redis不可用，从数据库获取用户信息（无 employee 关联）
    const userResult = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatar: users.avatar,
        passwordChangedAt: users.passwordChangedAt,
        forcePasswordChange: users.forcePasswordChange,
        status: users.status,
        role_id: roles.id,
        role_name: roles.name,
        role_desc: roles.remark,
        is_superadmin: roles.is_superadmin,
      })
      .from(users)
      .leftJoin(roles, eq(users.role_id, roles.id))
      .where(eq(users.id, Number.parseInt(userId)))
      .limit(1)

    const dbUser = userResult[0] || null

    if (!dbUser) {
      throw createError({
        statusCode: 401,
        message: '用户不存在',
      })
    }

    // 检查用户状态
    if (dbUser.status !== 'active') {
      throw createError({
        statusCode: 403,
        message: '账户已被停用或暂停',
      })
    }

    // 查询用户权限
    let userPermissions: Array<{ id: string, name: string, desc: string | null }> = []

    if (dbUser.role_id) {
      if (dbUser.is_superadmin) {
        userPermissions = await db
          .select({
            id: permissions.id,
            name: permissions.name,
            desc: permissions.remark,
          })
          .from(permissions)
      }
      else {
        userPermissions = await db
          .select({
            id: permissions.id,
            name: permissions.name,
            desc: permissions.remark,
          })
          .from(rolePermissions)
          .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
          .where(eq(rolePermissions.roleId, dbUser.role_id))
      }
    }

    const user = {
      id: dbUser.id,
      username: dbUser.username,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      avatar: dbUser.avatar,
      roleId: dbUser.role_id,
      roleName: dbUser.role_name,
      roleDesc: dbUser.role_desc,
      permissions: userPermissions,
      permissionNames: userPermissions.map(p => p.name),
      needsPasswordChange: dbUser.forcePasswordChange || !dbUser.passwordChangedAt,
    }

    // 将用户认证状态缓存到Redis（如果可用）
    if (isRedisReady()) {
      await executeRedisCommand(async () => {
        const client = (await import('../../utils/redis')).getRedisClient()
        if (!client)
          return

        const cacheKey = `auth:user:${userId}`
        await client.set(cacheKey, JSON.stringify(user))
        console.log(`[API] 用户认证状态已缓存: ${userId}`)
      })
    }

    return {
      user,
      valid: true,
    }
  }
  catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw createError({
        statusCode: 401,
        message: '令牌无效或已过期',
      })
    }

    if (error.statusCode === 403) {
      throw error
    }

    console.error('认证中间件错误:', error)
    throw createError({
      statusCode: 500,
      message: '认证过程中发生错误',
    })
  }
})
