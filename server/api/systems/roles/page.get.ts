import { count, like } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { roles } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:role.read')) {
      throw createError({ statusCode: 401, message: '没有权限访问角色数据' })
    }

    const query = getQuery(event)
    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 10
    const name = query.name as string
    const offset = (page - 1) * pageSize

    // 构建 where 条件
    const where = name && name.trim()
      ? like(roles.name, `%${name.trim()}%`)
      : undefined

    // 获取总数
    const totalResult = await db
      .select({ count: count() })
      .from(roles)
      .where(where)

    const total = totalResult[0]?.count || 0

    // 获取分页数据
    const rolesTable = await db
      .select()
      .from(roles)
      .where(where)
      .orderBy(roles.created_at)
      .limit(pageSize)
      .offset(offset)

    // 处理角色数据
    const rolesWithStats = rolesTable.map((role) => {
      const systemRoles = ['管理员', '超级管理员', '员工']
      const isSystem = systemRoles.includes(role.name)

      return {
        ...role,
        isSystem,
      }
    })

    return {
      data: rolesWithStats,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrev: page > 1,
      },
      code: 200,
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
