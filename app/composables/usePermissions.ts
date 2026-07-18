export function usePermissions() {
  const auth = useAuth()

  // 检查是否有后台访问权限
  const checkHasAdminAccess = (): boolean => {
    return auth.permissionsByCategory.value.features.includes('feature:admin_access')
  }

  // 检查页面访问权限
  const canAccessPage = (pageName: string): boolean => {
    console.log(auth.permissionsByCategory.value.pages)
    return auth.permissionsByCategory.value.pages.includes(`page:${pageName}`)
  }

  // 检查菜单访问权限
  const canAccessMenu = (menuName: string): boolean => {
    return auth.permissionsByCategory.value.menus.includes(`menu:${menuName}`)
  }

  // 检查操作权限
  const canPerformAction = (resource: string, action: string): boolean => {
    return auth.permissionsByCategory.value.actions.some(
      a => a.resource === resource && a.action === action,
    )
  }

  // 获取可访问的页面列表
  const getAccessiblePages = (): string[] => {
    return auth.permissionsByCategory.value.pages.map(p => p.replace('page:', ''))
  }

  // 获取可访问的菜单列表
  const getAccessibleMenus = (): string[] => {
    return auth.permissionsByCategory.value.menus.map(m => m.replace('menu:', ''))
  }

  return {
    canAccessPage,
    canPerformAction,
    getAccessiblePages,
    getAccessibleMenus,
    checkHasAdminAccess,
    canAccessMenu,
  }
}
