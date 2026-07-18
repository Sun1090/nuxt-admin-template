// utils/check-system-init.ts
import { db, permissions, rolePermissions, roles } from '~/drizzle/db'

export async function checkSystemInitialization() {
  try {
    // 检查基本表是否存在数据
    const [rolesCount, permissionsCount, rolePermissionsCount] = await Promise.all([
      db.select().from(roles).limit(1),
      db.select().from(permissions).limit(1),
      db.select().from(rolePermissions).limit(1),
    ])

    const hasRoles = rolesCount.length > 0
    const hasPermissions = permissionsCount.length > 0
    const hasRolePermissions = rolePermissionsCount.length > 0

    return {
      isInitialized: hasRoles && hasPermissions && hasRolePermissions,
      details: {
        roles: hasRoles,
        permissions: hasPermissions,
        rolePermissions: hasRolePermissions,
      },
    }
  }
  catch (error) {
    console.error('检查系统初始化状态失败:', error)
    return {
      isInitialized: false,
      details: {
        roles: false,
        permissions: false,
        rolePermissions: false,
      },
    }
  }
}
