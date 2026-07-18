import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { permissions, rolePermissions } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:permission.delete')) {
      throw createError({ statusCode: 401, message: '没有权限获取权限数据' })
    }
    const permissionId = getRouterParam(event, 'id')

    // 检查权限是否存在
    const existingPermission = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, permissionId))
      .limit(1)

    if (existingPermission.length === 0) {
      throw createError({
        statusCode: 404,
        message: '权限不存在',
      })
    }

    // 检查是否有关联的角色权限
    const rolePermission = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.permissionId, permissionId))
      .limit(1)

    if (rolePermission.length > 0) {
      throw createError({
        statusCode: 400,
        message: '该权限已被角色使用，无法删除',
      })
    }

    // 删除权限
    await db
      .delete(permissions)
      .where(eq(permissions.id, permissionId))

    return { success: true, message: '权限删除成功' }
  }
  catch (error: any) {
    if (error.statusCode === 400 || error.statusCode === 404) {
      throw error
    }
    console.error('删除权限失败:', error)
    throw createError({
      statusCode: 500,
      message: '删除权限失败',
    })
  }
})
