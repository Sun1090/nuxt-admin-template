import { count, desc, like, or } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { permissions } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:permission.read')) {
      throw createError({ statusCode: 401, message: '没有权限获取权限数据' })
    }
    const query = getQuery(event)

    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 10
    const name = query.name as string
    const offset = (page - 1) * pageSize

    // 构建 where 条件 - 添加多字段搜索
    let where
    if (name && name.trim()) {
      const searchTerm = `%${name.trim()}%`
      // 在 name 和 remark 字段中搜索
      where = or(
        like(permissions.name, searchTerm),
        like(permissions.remark, searchTerm),
      )
    }

    // 获取总数
    const totalResult = await db
      .select({ count: count() })
      .from(permissions)
      .where(where)

    const total = totalResult[0]?.count || 0

    // 获取分页数据
    const permissionsTable = await db
      .select()
      .from(permissions)
      .where(where)
      .orderBy(desc(permissions.created_at))
      .limit(pageSize)
      .offset(offset)

    return {
      data: permissionsTable,
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
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || '获取权限列表失败',
    })
  }
})
