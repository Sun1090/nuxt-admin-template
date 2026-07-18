import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { rolePermissions, roles } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:role.update')) {
      throw createError({ statusCode: 401, message: '没有权限更新角色数据' })
    }
    const roleId = getRouterParam(event, 'id')
    const { permissionIds } = await readBody(event)

    // 检查角色是否存在
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1)

    if (existingRole.length === 0) {
      throw createError({
        statusCode: 404,
        message: '角色不存在',
      })
    }

    await db.transaction(async (tx) => {
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId))
      if (permissionIds.length > 0) {
        await tx.insert(rolePermissions).values(
          permissionIds.map(permissionId => ({
            roleId,
            permissionId,
          })),
        )
      }
    })

    return { success: true, message: '权限分配成功' }
  }
  catch (error: any) {
    if (error.statusCode === 404) {
      throw error
    }
    console.error('更新角色权限失败:', error)
    throw createError({
      statusCode: 500,
      message: '更新角色权限失败',
    })
  }
})
