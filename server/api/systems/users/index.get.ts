import { desc } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { users } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:user.read')) {
      throw createError({ statusCode: 401, message: '没有权限访问用户数据' })
    }
    // 获取分页数据（带筛选条件和排序）
    const userList = await db
      .select()
      .from(users)
      .orderBy(desc(users.username))

    return {
      data: userList,
      code: 200,
    }
  }
  catch (error) {
    console.error('获取用户列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取用户列表失败',
    })
  }
})
