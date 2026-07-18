import process from 'node:process'
import bcrypt from 'bcrypt'
import { db, eq, users } from '~/drizzle/db'
import { getBeijingTime } from '~/utils/timeUtils'

export default defineEventHandler(async (event) => {
  try {
    // 检查认证
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        message: '未授权',
      })
    }

    const body = await readBody(event)
    if (!body.newPassword) {
      throw createError({
        statusCode: 400,
        message: '新密码不能为空',
      })
    }

    // 验证密码强度
    if (body.newPassword.length < 6) {
      throw createError({
        statusCode: 400,
        message: '密码长度至少6位',
      })
    }

    // 获取用户信息
    const currentUserResult = await db
      .select({
        id: users.id,
        password: users.password,
        passwordChangedAt: users.passwordChangedAt,
        forcePasswordChange: users.forcePasswordChange,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    const currentUser = currentUserResult[0]
    if (!currentUser) {
      throw createError({
        statusCode: 404,
        message: '用户不存在',
      })
    }

    // 检查用户状态
    if (currentUser.status !== 'active') {
      throw createError({
        statusCode: 403,
        message: '账户已被停用，无法设置密码',
      })
    }

    // 检查是否需要设置初始密码
    if (currentUser.passwordChangedAt && !currentUser.forcePasswordChange) {
      throw createError({
        statusCode: 400,
        message: '您已经设置过密码，请使用修改密码功能',
      })
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(body.newPassword, 12)

    // 更新密码
    await db.update(users)
      .set({
        password: hashedPassword,
        passwordChangedAt: getBeijingTime(),
        forcePasswordChange: false,
        updated_at: getBeijingTime(),
      })
      .where(eq(users.id, user.id))

    // 清除用户认证缓存（如果使用Redis）
    try {
      if (process.env.REDIS_URL) {
        const { executeRedisCommand } = await import('../../utils/redis')
        await executeRedisCommand(async () => {
          const client = (await import('../../utils/redis')).getRedisClient()
          if (client) {
            const cacheKey = `auth:user:${user.id}`
            await client.del(cacheKey)
            console.log(`[API] 用户认证缓存已清除: ${user.id}`)
          }
        })
      }
    }
    catch (cacheError) {
      console.warn('清除缓存失败:', cacheError)
      // 不阻止主要操作
    }

    return {
      success: true,
      message: '初始密码设置成功',
    }
  }
  catch (error: any) {
    console.error('设置初始密码错误:', error)

    // 处理bcrypt错误
    if (error.message.includes('data and salt arguments required')) {
      throw createError({
        statusCode: 400,
        message: '密码格式错误',
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '初始密码设置失败',
    })
  }
})
