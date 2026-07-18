import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { permissions, rolePermissions } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:role.read')) {
      throw createError({ statusCode: 401, message: '没有权限更新角色数据' })
    }
    const roleId = getRouterParam(event, 'id')

    // 获取角色的所有权限
    const rolePermissionArr = await db
      .select({
        permission: permissions,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId))

    return {
      permissions: rolePermissionArr.map(rp => rp.permission),
    }
  }
  catch (error) {
    console.error('获取角色权限失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取角色权限失败',
    })
  }
})
