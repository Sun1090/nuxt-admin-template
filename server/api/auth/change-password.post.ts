import process from 'node:process'
import bcrypt from 'bcrypt'
import { db, eq, users } from '~/drizzle/db'
import { getBeijingTime } from '~/utils/timeUtils'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        message: '未授权',
      })
    }

    const body = await readBody(event)
    if (!body.currentPassword || !body.newPassword) {
      throw createError({
        statusCode: 400,
        message: '当前密码和新密码不能为空',
      })
    }

    if (body.newPassword.length < 6) {
      throw createError({
        statusCode: 400,
        message: '新密码长度至少6位',
      })
    }

    // 获取用户信息
    const currentUserResult = await db
      .select({
        id: users.id,
        password: users.password,
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

    if (currentUser.status !== 'active') {
      throw createError({
        statusCode: 403,
        message: '账户已被停用',
      })
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(body.currentPassword, currentUser.password)
    if (!isPasswordValid) {
      throw createError({
        statusCode: 400,
        message: '当前密码不正确',
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

    // 清除用户认证缓存
    try {
      if (process.env.REDIS_URL) {
        const { executeRedisCommand } = await import('../../utils/redis')
        await executeRedisCommand(async () => {
          const client = (await import('../../utils/redis')).getRedisClient()
          if (client) {
            const cacheKey = `auth:user:${user.id}`
            await client.del(cacheKey)
          }
        })
      }
    }
    catch {
      // 缓存清除失败不影响主要操作
    }

    return {
      success: true,
      message: '密码修改成功',
    }
  }
  catch (error: any) {
    console.error('修改密码错误:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '密码修改失败',
    })
  }
})
