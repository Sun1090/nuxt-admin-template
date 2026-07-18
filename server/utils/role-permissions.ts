import { eq } from 'drizzle-orm'
// utils/role-permissions.ts
import { db, permissions, rolePermissions, roles } from '~/drizzle/db'

// 缓存角色权限配置
let rolePermissionsCache: Map<string, any> = new Map()

/**
 * 从数据库加载角色权限配置
 */
async function loadRolePermissions() {
  try {
    const allRoles = await db.select().from(roles)
    const allPermissions = await db.select().from(permissions)

    const rolePerms = await db
      .select({
        roleId: rolePermissions.roleId,
        permissionId: rolePermissions.permissionId,
      })
      .from(rolePermissions)

    // 构建角色权限映射
    const roleMap = new Map()
    for (const role of allRoles) {
      const rolePermIds = rolePerms
        .filter(rp => rp.roleId === role.id)
        .map(rp => rp.permissionId)

      const rolePermissionsList = allPermissions.filter(p =>
        rolePermIds.includes(p.id),
      )

      roleMap.set(role.id, {
        id: role.id,
        name: role.name,
        desc: role.remark,
        permissions: rolePermissionsList,
      })
    }

    rolePermissionsCache = roleMap
    return roleMap
  }
  catch (error) {
    console.error('加载角色权限失败:', error)
    return new Map()
  }
}

/**
 * 获取用户权限
 */
async function getUserPermissions(user: any) {
  if (!user?.roleId)
    return []

  // 如果缓存中有，直接返回
  const roleConfig = rolePermissionsCache.get(user.roleId)
  if (roleConfig) {
    return roleConfig.permissions
  }

  // 否则从数据库查询
  const permission = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      desc: permissions.remark,
      category: permissions.category,
      resource: permissions.resource,
      action: permissions.action,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, user.roleId))

  return permission
}

/**
 * 检查用户是否有页面访问权限
 */
async function canAccessPage(user: any, pageName: string): Promise<boolean> {
  const userPermissions = await getUserPermissions(user)
  return userPermissions.some(p =>
    p.category === 'page' && p.name === `page:${pageName}`,
  )
}

/**
 * 检查用户是否有菜单访问权限
 */
async function canAccessMenu(user: any, menuName: string): Promise<boolean> {
  const userPermissions = await getUserPermissions(user)
  return userPermissions.some(p =>
    p.category === 'menu' && p.name === `menu:${menuName}`,
  )
}

/**
 * 检查用户是否有操作权限
 */
async function canPerformAction(user: any, resource: string, action: string): Promise<boolean> {
  const userPermissions = await getUserPermissions(user)
  return userPermissions.some(p =>
    p.category === 'action'
    && p.resource === resource
    && p.action === action,
  )
}

/**
 * 获取用户可访问的页面列表
 */
async function getUserAccessiblePages(user: any): Promise<string[]> {
  const userPermissions = await getUserPermissions(user)
  return userPermissions
    .filter(p => p.category === 'page')
    .map(p => p.name.replace('page:', ''))
}

/**
 * 获取用户可访问的菜单列表
 */
async function getUserAccessibleMenus(user: any): Promise<string[]> {
  const userPermissions = await getUserPermissions(user)
  return userPermissions
    .filter(p => p.category === 'menu')
    .map(p => p.name.replace('menu:', ''))
}

/**
 * 检查用户是否可以访问后台
 */
async function canAccessAdmin(user: any): Promise<boolean> {
  const userPermissions = await getUserPermissions(user)
  return userPermissions.some(p =>
    p.category === 'feature' && p.name === 'feature:admin_access',
  )
}

// 初始化加载
loadRolePermissions()

export {
  canAccessAdmin,
  canAccessMenu,
  canAccessPage,
  canPerformAction,
  getUserAccessibleMenus,
  getUserAccessiblePages,
  getUserPermissions,
  loadRolePermissions,
}
