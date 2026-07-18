import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { permissions } from '~/drizzle/schema'
import { generatePermissionName } from '~/utils/common'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:permission.update')) {
      throw createError({ statusCode: 401, message: '没有权限更新权限数据' })
    }
    const body = await readBody(event)

    // 使用工具函数生成名称
    const newName = generatePermissionName(
      body.category,
      body.resource,
      body.action,
    )

    // 验证权限名称是否已存在
    const existingPermission = await db
      .select()
      .from(permissions)
      .where(eq(permissions.name, newName))
      .limit(1)

    if (existingPermission.length > 0) {
      throw createError({
        statusCode: 400,
        message: '权限名称已存在',
      })
    }

    // 创建权限
    const [newPermission] = await db
      .insert(permissions)
      .values({
        name: newName,
        remark: body.remark,
        category: body.category,
        resource: body.resource,
        action: body.action,
      })
      .returning()

    return newPermission
  }
  catch (error: any) {
    if (error.statusCode === 400) {
      throw error
    }
    console.error('创建权限失败:', error)
    throw createError({
      statusCode: 500,
      message: '创建权限失败',
    })
  }
})
