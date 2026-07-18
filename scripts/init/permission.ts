export async function initializeDefaultPermissions() {
  const defaultPermissions = [
    // 页面权限
    { name: 'page:overview', desc: '访问数据概览页面', category: 'page' },
    { name: 'page:users', desc: '访问用户管理页面', category: 'page' },
    { name: 'page:roles', desc: '访问角色管理页面', category: 'page' },
    { name: 'page:permissions', desc: '访问权限管理页面', category: 'page' },
    { name: 'page:api_keys', desc: '访问API密钥管理页面', category: 'page' },
    { name: 'page:database', desc: '访问数据库管理页面', category: 'page' },
    { name: 'page:settings', desc: '访问系统设置页面', category: 'page' },

    // 菜单权限
    { name: 'menu:dashboard', desc: '显示仪表盘菜单', category: 'menu' },
    { name: 'menu:system_mgmt', desc: '显示系统管理菜单', category: 'menu' },

    // 功能权限
    { name: 'feature:admin_access', desc: '访问后台管理功能', category: 'feature' },
  ]

  for (const perm of defaultPermissions) {
    const existing = await db
      .select()
      .from(permissions)
      .where(eq(permissions.name, perm.name))
      .limit(1)

    if (existing.length === 0) {
      await db.insert(permissions).values(perm)
    }
  }
}
