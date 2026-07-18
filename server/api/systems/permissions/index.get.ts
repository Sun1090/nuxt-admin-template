import { db } from '~/drizzle/db'
import { permissions } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:permission.read')) {
      throw createError({ statusCode: 401, message: '没有权限获取权限数据' })
    }
    const permission = await db.select().from(permissions).orderBy(permissions.name)
    return permission
  }
  catch (error) {
    console.error('获取权限列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取权限列表失败',
    })
  }
})
