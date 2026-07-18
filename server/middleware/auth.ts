import { eq } from 'drizzle-orm'
import { db, permissions, rolePermissions, roles, users } from '~/drizzle/db'
import { JWTEnhanced } from '../utils/jwt-enhanced'

interface JwtPayload {
  userId: string
  roleId?: string
  roleName: string
  permissions: string[]
}

export default defineEventHandler(async (event) => {
  // 清除上一轮残留的用户上下文
  if (event.context.user) {
    delete event.context.user
  }

  const url = getRequestURL(event)
  const pathname = url.pathname

  // 跳过非 API 路由
  if (!pathname.startsWith('/api/')) {
    return
  }

  // 公共 API 路径，跳过认证
  const publicApiPaths = [
    '/api/auth/login',
    '/api/auth/verify',
    '/api/site-config',
    '/api/proxy/',
    '/api/open/',
  ]
  if (publicApiPaths.some(path => pathname.startsWith(path))) {
    return
  }

  // 从请求头或 cookie 获取 token
  let token: string | null = null
  const authHeader = getRequestHeader(event, 'authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  if (!token) {
    token = getCookie(event, 'auth-token') || null
  }

  if (!token) {
    return sendError(event, createError({
      statusCode: 401,
      message: '未授权访问：缺少有效的认证信息',
    }))
  }

  try {
    const decoded = JWTEnhanced.verifyToken(token) as JwtPayload

    // 查询用户信息（含角色）
    const userResult = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatar: users.avatar,
        role_id: users.role_id,
        status: users.status,
        role_name: roles.name,
        role_desc: roles.remark,
        is_superadmin: roles.is_superadmin,
      })
      .from(users)
      .leftJoin(roles, eq(users.role_id, roles.id))
      .where(eq(users.id, decoded.userId))
      .limit(1)

    const user = userResult[0] || null
    if (!user) {
      return sendError(event, createError({
        statusCode: 401,
        message: '用户不存在，请重新登录',
      }))
    }

    if (user.status !== 'active') {
      return sendError(event, createError({
        statusCode: 403,
        message: '账户已被停用，无法访问系统',
      }))
    }

    // 查询用户权限（超管自动授予全部权限）
    let userPermissions: string[] = []
    if (user.role_id) {
      if (user.is_superadmin) {
        const allPermissions = await db.select({ name: permissions.name }).from(permissions)
        userPermissions = allPermissions.map(p => p.name)
      }
      else {
        const rolePermissionsResult = await db
          .select({ name: permissions.name })
          .from(rolePermissions)
          .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
          .where(eq(rolePermissions.roleId, user.role_id))
        userPermissions = rolePermissionsResult.map(p => p.name)
      }
    }

    event.context.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      roleId: user.role_id,
      roleName: user.role_name,
      roleDesc: user.role_desc,
      is_superadmin: user.is_superadmin,
      permissions: userPermissions,
    }

    // 细粒度 API 权限检查
    if (userPermissions.length > 0) {
      const requiredPermission = getRequiredPermission(pathname, event.method)
      if (requiredPermission && !userPermissions.includes(requiredPermission)) {
        return sendError(event, createError({
          statusCode: 403,
          message: '权限不足，无法访问该资源',
        }))
      }
    }
  }
  catch (error: any) {
    console.error('JWT验证失败:', error)
    return sendError(event, createError({
      statusCode: 401,
      message: error.name === 'TokenExpiredError' ? '登录已过期，请重新登录' : '认证失败',
      data: { invalidToken: true },
    }))
  }
})

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/**
 * 开放 API 资源到所需权限的映射表
 * 模板默认为空，按业务需要扩展
 */
const OPEN_API_PERMISSION_MAP: Array<{
  pattern: RegExp
  read?: string
  write?: string
}> = [
  // 示例：
  // { pattern: /^\/api\/open\/users/, read: 'action:user.read', write: 'action:user.write' },
]

/**
 * 根据路径和方法获取所需权限
 */
function getRequiredPermission(pathname: string, method: string): string | null {
  const isRead = READ_METHODS.has(method.toUpperCase())
  for (const route of OPEN_API_PERMISSION_MAP) {
    if (route.pattern.test(pathname)) {
      return isRead ? (route.read ?? null) : (route.write ?? null)
    }
  }
  return null
}
