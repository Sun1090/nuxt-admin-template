import { and, eq, ne } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { permissions } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:role.update')) {
      throw createError({ statusCode: 401, message: '没有权限更新用户数据' })
    }
    const permissionId = getRouterParam(event, 'id')
    const body = await readBody(event)

    console.log('更新权限请求:', { permissionId, body })

    // 验证必填字段
    if (!body.category?.trim()) {
      throw createError({
        statusCode: 400,
        message: '权限分类不能为空',
      })
    }

    if (!body.resource?.trim()) {
      throw createError({
        statusCode: 400,
        message: '资源名称不能为空',
      })
    }

    if (!body.action?.trim()) {
      throw createError({
        statusCode: 400,
        message: '操作类型不能为空',
      })
    }

    // 自动拼接 name
    const newName = `${body.category.trim()}:${body.resource.trim()}.${body.action.trim()}`

    // 检查权限是否存在
    const existingPermission = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, permissionId))

    if (existingPermission.length === 0) {
      throw createError({
        statusCode: 404,
        message: '权限不存在',
      })
    }

    // 检查权限名称是否冲突（排除自己）
    const nameConflict = await db
      .select()
      .from(permissions)
      .where(and(
        eq(permissions.name, newName),
        ne(permissions.id, permissionId),
      ))

    if (nameConflict.length > 0) {
      throw createError({
        statusCode: 400,
        message: '权限名称已存在',
      })
    }

    // 更新权限
    const [updatedPermission] = await db
      .update(permissions)
      .set({
        name: newName, // 使用拼接后的名称
        remark: body.remark?.trim() || null,
        category: body.category.trim(),
        resource: body.resource.trim(),
        action: body.action.trim(),
        updated_at: new Date().toISOString(),
      })
      .where(eq(permissions.id, permissionId))
      .returning()

    console.log('权限更新成功:', updatedPermission)
    return updatedPermission
  }
  catch (error: any) {
    console.error('更新权限失败:', error)

    if (error.statusCode === 400 || error.statusCode === 404) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: `更新权限失败: ${error.message || '未知错误'}`,
    })
  }
})
