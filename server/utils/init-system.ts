import { db, permissions, rolePermissions, roles } from '~/drizzle/db'

export async function initializeSystem() {
  console.log('开始初始化系统数据...')

  try {
    // 检查是否已经初始化
    const existingRoles = await db.select().from(roles).limit(1)
    if (existingRoles.length > 0) {
      console.log('系统已经初始化过，跳过初始化')
      return
    }

    // 1. 插入权限
    console.log('插入权限数据...')
    const permissionData = [
      // ===== 页面权限 =====
      { name: 'page:overview', remark: '访问数据概览页面', category: 'page', resource: null, action: null },
      { name: 'page:users', remark: '访问用户管理页面', category: 'page', resource: null, action: null },
      { name: 'page:roles', remark: '访问角色管理页面', category: 'page', resource: null, action: null },
      { name: 'page:permissions', remark: '访问权限管理页面', category: 'page', resource: null, action: null },
      { name: 'page:api_keys', remark: '访问API密钥页面', category: 'page', resource: null, action: null },
      { name: 'page:system_settings', remark: '访问系统设置页面', category: 'page', resource: null, action: null },
      { name: 'page:email_templates', remark: '访问邮件模板页面', category: 'page', resource: null, action: null },
      { name: 'page:api_logs', remark: '访问API访问日志页面', category: 'page', resource: null, action: null },
      { name: 'page:user_status_logs', remark: '访问用户状态日志页面', category: 'page', resource: null, action: null },
      { name: 'page:notifications', remark: '访问通知中心页面', category: 'page', resource: null, action: null },
      { name: 'page:system_database_backup', remark: '访问数据库备份页面', category: 'page', resource: null, action: null },
      { name: 'page:system_database_manage', remark: '访问数据库管理页面', category: 'page', resource: null, action: null },

      // ===== ================ =====

      // ===== 菜单权限 =====
      { name: 'menu:dashboard', remark: '显示仪表盘菜单', category: 'menu', resource: null, action: null },
      { name: 'menu:user_mgmt', remark: '显示用户管理菜单', category: 'menu', resource: null, action: null },
      { name: 'menu:role_mgmt', remark: '显示角色管理菜单', category: 'menu', resource: null, action: null },
      { name: 'menu:permission_mgmt', remark: '显示权限管理菜单', category: 'menu', resource: null, action: null },
      { name: 'menu:api_keys', remark: '显示API密钥菜单', category: 'menu', resource: null, action: null },
      { name: 'menu:email_templates', remark: '显示邮件模板菜单', category: 'menu', resource: null, action: null },
      { name: 'menu:api_logs', remark: '显示API访问日志菜单', category: 'menu', resource: null, action: null },
      { name: 'menu:user_status_logs', remark: '显示用户状态日志菜单', category: 'menu', resource: null, action: null },
      { name: 'menu:system_settings', remark: '显示系统设置菜单', category: 'menu', resource: null, action: null },
      { name: 'menu:system_database_backup', remark: '显示数据库备份菜单', category: 'menu', resource: null, action: null },
      { name: 'menu:system_database_manage', remark: '显示数据库管理菜单', category: 'menu', resource: null, action: null },
      { name: 'menu:notifications', remark: '显示通知中心菜单', category: 'menu', resource: null, action: null },

      // ===== ================ =====

      // ===== 功能权限 =====
      { name: 'feature:admin_access', remark: '访问后台管理功能', category: 'feature', resource: null, action: null },
      { name: 'feature:export_data', remark: '导出数据功能', category: 'feature', resource: null, action: null },
      { name: 'feature:import_data', remark: '导入数据功能', category: 'feature', resource: null, action: null },

      // ===== ================ =====

      // ===== 操作权限 - 用户管理 =====
      { name: 'action:user.create', remark: '创建用户', category: 'action', resource: 'user', action: 'create' },
      { name: 'action:user.read', remark: '查看用户', category: 'action', resource: 'user', action: 'read' },
      { name: 'action:user.update', remark: '编辑用户', category: 'action', resource: 'user', action: 'update' },
      { name: 'action:user.delete', remark: '删除用户', category: 'action', resource: 'user', action: 'delete' },
      { name: 'action:user.reset_password', remark: '重置用户密码', category: 'action', resource: 'user', action: 'reset_password' },

      // ===== 操作权限 - 角色管理 =====
      { name: 'action:role.create', remark: '创建角色', category: 'action', resource: 'role', action: 'create' },
      { name: 'action:role.read', remark: '查看角色', category: 'action', resource: 'role', action: 'read' },
      { name: 'action:role.update', remark: '编辑角色', category: 'action', resource: 'role', action: 'update' },
      { name: 'action:role.delete', remark: '删除角色', category: 'action', resource: 'role', action: 'delete' },

      // ===== 操作权限 - 权限管理 =====
      { name: 'action:permission.create', remark: '创建权限', category: 'action', resource: 'permission', action: 'create' },
      { name: 'action:permission.read', remark: '查看权限', category: 'action', resource: 'permission', action: 'read' },
      { name: 'action:permission.update', remark: '编辑权限', category: 'action', resource: 'permission', action: 'update' },
      { name: 'action:permission.delete', remark: '删除权限', category: 'action', resource: 'permission', action: 'delete' },

      // ===== 操作权限 - API密钥 =====
      { name: 'action:api_key.create', remark: '创建API密钥', category: 'action', resource: 'api_key', action: 'create' },
      { name: 'action:api_key.read', remark: '查看API密钥', category: 'action', resource: 'api_key', action: 'read' },
      { name: 'action:api_key.update', remark: '编辑API密钥', category: 'action', resource: 'api_key', action: 'update' },
      { name: 'action:api_key.delete', remark: '删除API密钥', category: 'action', resource: 'api_key', action: 'delete' },

      // ===== ================ =====

      // ===== 操作权限 - 邮件模板 =====
      { name: 'action:template.create', remark: '创建邮件模板', category: 'action', resource: 'template', action: 'create' },
      { name: 'action:template.read', remark: '查看邮件模板', category: 'action', resource: 'template', action: 'read' },
      { name: 'action:template.update', remark: '编辑邮件模板', category: 'action', resource: 'template', action: 'update' },
      { name: 'action:template.delete', remark: '删除邮件模板', category: 'action', resource: 'template', action: 'delete' },
    ]

    await db.insert(permissions).values(permissionData as any)
    const allPermissions = await db.select().from(permissions)

    // 2. 插入角色
    console.log('插入角色数据...')
    const roleData = [
      { name: '超级管理员', remark: '系统最高权限管理员，拥有所有权限', is_superadmin: true },
      { name: '系统管理员', remark: '系统管理员，拥有大部分管理权限', is_superadmin: false },
      { name: '普通用户', remark: '普通用户，基础查看权限', is_superadmin: false },
    ]

    await db.insert(roles).values(roleData)
    const allRoles = await db.select().from(roles)

    // 3. 分配权限
    console.log('分配角色权限...')

    // 超级管理员 - 所有权限
    const superAdmin = allRoles.find(r => r.name === '超级管理员')
    if (superAdmin) {
      await db.insert(rolePermissions).values(
        allPermissions.map(p => ({
          roleId: superAdmin.id,
          permissionId: p.id,
        })),
      )
    }

    // 系统管理员 - 排除权限管理删除和角色删除
    const sysAdmin = allRoles.find(r => r.name === '系统管理员')
    if (sysAdmin) {
      const sysAdminPermissions = allPermissions.filter(p =>
        !p.name.startsWith('action:permission.delete')
        && !p.name.startsWith('action:role.delete'),
      )
      await db.insert(rolePermissions).values(
        sysAdminPermissions.map(p => ({
          roleId: sysAdmin.id,
          permissionId: p.id,
        })),
      )
    }

    // 普通用户 - 基础查看权限
    const normalUser = allRoles.find(r => r.name === '普通用户')
    if (normalUser) {
      const normalUserPermissionNames = new Set([
        'page:overview',
        'menu:dashboard',
        'feature:admin_access',
        'action:user.read',
        'action:role.read',
        'action:permission.read',
        'action:api_key.read',
        'page:notifications',
        'page:system_database_backup',
        'page:system_database_manage',
        'page:email_templates',
        'page:api_logs',
        'page:user_status_logs',
        'menu:email_templates',
        'menu:api_logs',
        'menu:user_status_logs',
        'menu:notifications',
        'menu:system_database_backup',
        'menu:system_database_manage',
        'action:template.read',
      ])
      const normalUserPermissions = allPermissions.filter(p =>
        normalUserPermissionNames.has(p.name),
      )
      await db.insert(rolePermissions).values(
        normalUserPermissions.map(p => ({
          roleId: normalUser.id,
          permissionId: p.id,
        })),
      )
    }

    console.log('系统初始化完成！')
  }
  catch (_error) {
    console.error('系统初始化失败:', _error)
    throw _error
  }
}
