import { eq } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { roles } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:role.update')) {
      throw createError({ statusCode: 401, message: '没有权限更新角色数据' })
    }
    const body = await readBody(event)

    // 验证角色名称是否已存在
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, body.name))
      .limit(1)

    if (existingRole.length > 0) {
      throw createError({
        statusCode: 400,
        message: '角色名称已存在',
      })
    }

    // 创建角色
    const [newRole] = await db
      .insert(roles)
      .values({
        name: body.name,
        remark: body.remark,
      })
      .returning()

    return newRole
  }
  catch (error: any) {
    if (error.statusCode === 400) {
      throw error
    }
    console.error('创建角色失败:', error)
    throw createError({
      statusCode: 500,
      message: '创建角色失败',
    })
  }
})
