import type { StatusEnum } from '~/drizzle/schema'
import { and, desc, eq, like, sql } from 'drizzle-orm'
import { db } from '~/drizzle/db'
import { roles, users } from '~/drizzle/schema'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user?.permissions?.includes('action:user.read')) {
      throw createError({ statusCode: 403, message: '没有权限访问用户数据' })
    }

    const query = getQuery(event)
    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 10
    const offset = (page - 1) * pageSize

    const username = query.username as string
    const status = query.status as string
    const role = query.role as string

    const whereConditions = []

    if (username && username.trim()) {
      whereConditions.push(like(users.username, `%${username.trim()}%`))
    }

    if (status && status.trim()) {
      whereConditions.push(eq(users.status, status.trim() as StatusEnum))
    }

    if (role && role.trim()) {
      whereConditions.push(eq(roles.name, role.trim()))
    }

    const baseQuery = db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        role_id: users.role_id,
        role_name: roles.name,
        status: users.status,
        email: users.email,
        phone: users.phone,
        avatar: users.avatar,
        last_login: users.last_login,
        lastLoginIp: users.lastLoginIp,
        forcePasswordChange: users.forcePasswordChange,
        passwordChangedAt: users.passwordChangedAt,
        created_at: users.created_at,
        updated_at: users.updated_at,
        statusChangedAt: users.statusChangedAt,
        statusChangedBy: users.statusChangedBy,
      })
      .from(users)
      .leftJoin(roles, eq(users.role_id, roles.id))

    const filteredQuery = whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(
        db
          .select()
          .from(users)
          .leftJoin(roles, eq(users.role_id, roles.id))
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
          .as('count_query'),
      )

    const total = Number(countResult[0]?.count) || 0

    const userList = await filteredQuery
      .orderBy(desc(users.created_at))
      .limit(pageSize)
      .offset(offset)

    return {
      data: userList,
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
  catch {
    throw createError({ statusCode: 500, message: '获取用户列表失败' })
  }
})
