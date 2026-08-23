import process from 'node:process'
import bcrypt from 'bcrypt'
import {
  getAccountLockRemainingTime,
  getIPBlockRemainingTime,
  isAccountLocked,
  isIPBlocked,
  recordLoginFailure,
  recordLoginSuccess,
} from '~~/server/services/securityService'
import { getClientIP } from '~~/server/utils/ip-utils'
import { JWTEnhanced } from '~~/server/utils/jwt-enhanced'
import { db, eq, users } from '~/drizzle/db'
import { getBeijingTime } from '~/utils/timeUtils'

export default defineEventHandler(async (event) => {
  const _startTime = Date.now()

  try {
    const body = await readBody(event)
    const clientIp = getClientIP(event)

    if (!body.username || !body.password) {
      throw createError({
        statusCode: 400,
        message: '账号名和密码不能为空',
      })
    }

    if (!process.env.JWT_SECRET) {
      throw createError({
        statusCode: 500,
        message: '服务器配置错误',
      })
    }

    // 数据库连接检查
    try {
      await db.select().from(users).limit(1)
    }
    catch {
      throw createError({
        statusCode: 503,
        message: '数据库服务暂时不可用',
      })
    }

    // 检查IP是否被限制
    if (isIPBlocked(clientIp)) {
      const remainingTime = getIPBlockRemainingTime(clientIp)
      throw createError({
        statusCode: 423,
        message: `您的IP地址已被限制访问，请在 ${remainingTime} 分钟后重试`,
      })
    }

    // 检查账户是否被锁定
    if (isAccountLocked(body.username)) {
      const remainingTime = getAccountLockRemainingTime(body.username)
      throw createError({
        statusCode: 423,
        message: `账户已被锁定，请在 ${remainingTime} 分钟后重试`,
      })
    }

    // 查找用户（基于 users 表，无 employee 关联）
    const userResult = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
      phone: users.phone,
      avatar: users.avatar,
      password: users.password,
      role_id: users.role_id,
      last_login: users.last_login,
      lastLoginIp: users.lastLoginIp,
      passwordChangedAt: users.passwordChangedAt,
      forcePasswordChange: users.forcePasswordChange,
      status: users.status,
    }).from(users).where(eq(users.username, body.username)).limit(1)

    const user = userResult[0] || null

    if (!user) {
      recordLoginFailure(body.username, clientIp)
      throw createError({
        statusCode: 401,
        message: '用户不存在',
      })
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(body.password, user.password)
    if (!isPasswordValid) {
      recordLoginFailure(body.username, clientIp)
      throw createError({
        statusCode: 401,
        message: '密码不正确',
      })
    }

    // 检查用户状态
    if (user.status === 'inactive') {
      throw createError({
        statusCode: 403,
        message: '账户已停用，无法登录系统。如有疑问请联系管理员。',
      })
    }

    if (user.status === 'suspended') {
      throw createError({
        statusCode: 403,
        message: '账户已暂停，无法登录系统。如有疑问请联系管理员。',
      })
    }

    // 登录成功，清除失败记录
    recordLoginSuccess(body.username, clientIp)

    // 更新登录信息
    await db.update(users)
      .set({
        last_login: getBeijingTime(),
        lastLoginIp: clientIp,
      })
      .where(eq(users.id, user.id))

    // 生成JWT
    const token = JWTEnhanced.generateToken(user.id, user.role_id || 'user')

    // 设置cookie
    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role_id: user.role_id,
        needsPasswordChange: !user.passwordChangedAt || user.forcePasswordChange,
      },
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '登录过程中发生未知错误',
    })
  }
})
