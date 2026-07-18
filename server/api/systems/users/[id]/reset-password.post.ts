import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { recordLoginFailure, recordLoginSuccess } from '~~/server/services/securityService'
import { getClientIP } from '~~/server/utils/ip-utils'
import { db } from '~/drizzle/db'
import { users } from '~/drizzle/schema'
import { getBeijingTime } from '~/utils/timeUtils'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = event.context.user
    if (!user?.permissions?.includes('action:user.reset_password')) {
      throw createError({ statusCode: 401, message: '没有权限更新用户数据' })
    }

    const body = await readBody(event)
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      throw createError({
        statusCode: 400,
        message: '当前密码和新密码不能为空',
      })
    }
    if (newPassword.length < 6) {
      throw createError({
        statusCode: 400,
        message: '新密码长度至少6位',
      })
    }
    // 查询用户详细信息
    const userDetailsResult = await db.select({
      id: users.id,
      username: users.username,
      password: users.password,
    })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    const userDetails = userDetailsResult[0]

    if (!userDetails) {
      throw createError({
        statusCode: 404,
        message: '用户不存在',
      })
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, userDetails.password)
    const clientIp = getClientIP(event)

    if (!isPasswordValid) {
      // 记录安全事件
      recordLoginFailure(userDetails.username, clientIp)

      throw createError({
        statusCode: 400,
        message: '当前密码不正确',
      })
    }

    // 检查新密码是否与当前密码相同
    const isSamePassword = await bcrypt.compare(body.newPassword, userDetails.password)
    if (isSamePassword) {
      throw createError({
        statusCode: 400,
        message: '新密码不能与当前密码相同',
      })
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(body.newPassword, 12)

    // 更新密码
    await db.update(users)
      .set({
        password: hashedNewPassword,
        passwordChangedAt: getBeijingTime(),
      })
      .where(eq(users.id, user.id))

    // 记录成功的密码修改
    recordLoginSuccess(userDetails.username, clientIp)

    // 清除用户认证缓存（密码已变更）
    try {
      const { cache } = await import('~~/server/utils/cache-helpers')
      await cache.delete(`auth:user:${user.id}`)
      console.log(`[Cache] 用户认证缓存已清除（密码修改）: ${user.id}`)
    }
    catch (cacheError) {
      console.warn('[Cache] 清除用户认证缓存失败:', cacheError)
    }

    return {
      success: true,
      message: '密码修改成功',
    }
  }
  catch (error: any) {
    // 已格式化的错误直接抛出
    if (error.statusCode) {
      throw error
    }

    // 记录错误信息
    console.error('修改密码过程中发生未处理的错误:', error)

    // 创建错误响应
    throw createError({
      statusCode: 500,
      message: `修改密码失败: ${error.message || '未知错误'}`,
    })
  }
})
