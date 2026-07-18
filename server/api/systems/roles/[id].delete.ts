import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { rolePermissions, roles, users } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:role.delete')) {
      throw createError({ statusCode: 401, message: '没有权限删除角色数据' })
    }
    const roleId = getRouterParam(event, 'id')

    if (!roleId) {
      throw createError({
        statusCode: 400,
        message: '角色ID不能为空',
      })
    }

    // 检查角色是否存在
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))

    if (existingRole.length === 0) {
      throw createError({
        statusCode: 404,
        message: '角色不存在',
      })
    }

    // 检查是否有用户使用此角色 - 修复字段名
    const usersWithRole = await db
      .select()
      .from(users)
      .where(eq(users.role_id, roleId)) // 注意：这里应该是 role_id
      .limit(1)

    if (usersWithRole.length > 0) {
      throw createError({
        statusCode: 400,
        message: '该角色下还有用户，无法删除',
      })
    }

    // 删除角色权限关联
    await db
      .delete(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId))

    // 删除角色
    await db
      .delete(roles)
      .where(eq(roles.id, roleId))

    return { success: true, message: '角色删除成功' }
  }
  catch (error: any) {
    console.error('删除角色失败:', error)

    if (error.statusCode === 400 || error.statusCode === 404) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: `删除角色失败: ${error.message || '未知错误'}`,
    })
  }
})
