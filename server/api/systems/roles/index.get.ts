import { db } from '~/drizzle/db'
import { roles } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:role.read')) {
      throw createError({ statusCode: 401, message: '没有权限更新角色数据' })
    }

    const rolesTable = await db
      .select()
      .from(roles)

    return {
      data: rolesTable,
    }
  }
  catch (error) {
    console.error('获取角色列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取角色列表失败',
    })
  }
})
