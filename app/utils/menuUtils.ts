import type { BaseNavItem, NavGroupItem, NavItem, NavLinkItem, NavMenu, PermissionsByCategory } from '~/types/nav'

import { fullMenuConfig } from '~/constants/menus'

/**
 * 检查是否是分组菜单项
 */
function isNavGroupItem(item: NavItem): item is NavGroupItem {
  return 'children' in item && item.children !== undefined
}

/**
 * 检查是否是链接菜单项
 */
function isNavLinkItem(item: NavItem): item is NavLinkItem {
  return 'link' in item && item.link !== undefined
}

/**
 * 根据用户权限过滤菜单
 */
export function getAccessibleMenus(permissions: readonly string[]): NavMenu[] {
  // 确保在服务端有安全的回退
  if (typeof window === 'undefined' && (!permissions || permissions.length === 0)) {
    return [] // 服务端没有权限数据时返回空数组
  }
  return fullMenuConfig
    .map(section => ({
      ...section,
      items: section.items
        .map((item) => {
          // 检查权限
          if (item.requiredPermission && !permissions.includes(item.requiredPermission)) {
            return null
          }

          // 处理分组菜单项
          if (isNavGroupItem(item)) {
            const accessibleChildren = item.children.filter(child =>
              !child.requiredPermission || permissions.includes(child.requiredPermission),
            )

            // 如果子菜单全部无权限，则隐藏父菜单
            if (accessibleChildren.length === 0) {
              return null
            }

            return {
              ...item,
              children: accessibleChildren,
            }
          }

          // 处理链接菜单项
          if (isNavLinkItem(item)) {
            return item
          }

          return null
        })
        .filter((item): item is NavItem => item !== null), // 过滤掉 null 值并保持类型
    }))
    .filter(section => section.items.length > 0) // 过滤掉空的分组
}

/**
 * 获取用户有权限的所有菜单项（扁平化）
 */
export function getFlatAccessibleMenus(permissions: string[]): Array<{
  title: string
  link: string
  icon: string
}> {
  const accessibleMenus = getAccessibleMenus(permissions)
  const flatMenus: Array<{ title: string, link: string, icon: string }> = []

  accessibleMenus.forEach((section) => {
    section.items.forEach((item) => {
      if (isNavGroupItem(item)) {
        item.children.forEach((child) => {
          flatMenus.push({
            title: child.title,
            link: child.link,
            icon: child.icon || '',
          })
        })
      }
      else if (isNavLinkItem(item)) {
        flatMenus.push({
          title: item.title,
          link: item.link,
          icon: item.icon || '',
        })
      }
    })
  })

  return flatMenus
}

/**
 * 获取当前激活的菜单项
 */
export function getActiveMenuItem(currentPath: string, permissions: string[]): NavLinkItem | null {
  const flatMenus = getFlatAccessibleMenus(permissions)

  // 精确匹配
  const exactMatch = flatMenus.find(menu => menu.link === currentPath)
  if (exactMatch) {
    return exactMatch
  }

  // 前缀匹配（用于嵌套路由）
  const prefixMatch = flatMenus.find(menu => currentPath.startsWith(menu.link))
  return prefixMatch || null
}

// 处理权限数据，按类别分组
export function processPermissions(permissions: readonly string[]): PermissionsByCategory {
  const result: PermissionsByCategory = {
    pages: [],
    menus: [],
    features: [],
    actions: [],
  }

  permissions?.forEach((permission) => {
    // 解析权限字符串格式
    if (permission.startsWith('page:')) {
      result.pages.push(permission)
    }
    else if (permission.startsWith('menu:')) {
      result.menus.push(permission)
    }
    else if (permission.startsWith('feature:')) {
      result.features.push(permission)
    }
    else if (permission.startsWith('action:')) {
      // 解析 action:resource.action 格式
      const actionPart = permission.replace('action:', '')
      const [resource, action] = actionPart.split('.')
      if (resource && action) {
        result.actions.push({ resource, action })
      }
    }
  })

  return result
}

// 检查是否有权限访问动态路由
export function checkDynamicRoutePermission(routePath: string, userPermissions: string[]): boolean {
  const normalizedPath = routePath.replace(/\/\d+$/, '/[id]') // 将 /users/123 转换为 /users/[id]

  const findPermission = (items: BaseNavItem[]): string | null => {
    for (const item of items) {
      if (item.link === normalizedPath && item.requiredPermission) {
        return item.requiredPermission
      }
      if (item.children) {
        const permission = findPermission(item.children)
        if (permission)
          return permission
      }
    }
    return null
  }

  const requiredPermission = findPermission(fullMenuConfig.flatMap(section => section.items))
  return !requiredPermission || userPermissions.includes(requiredPermission)
}
