import type { NavItem, NavMenu } from '~/types/nav'
import { fullMenuConfig } from '~/constants/menus'

// 类型守卫
function isNavSectionTitle(item: NavItem | NavMenu): item is NavMenu {
  return 'heading' in item && !('link' in item)
}

export function useMenu() {
  // 根据用户权限过滤菜单
  const { canAccessMenu } = usePermissions()
  const accessibleMenu = computed(() => {
    const arr = fullMenuConfig.map(section => ({
      ...section,
      items: section.items
        .map((item) => {
          // 处理标题（不需要权限检查）
          if (isNavSectionTitle(item)) {
            return item
          }

          // 处理有子菜单的项
          if (item.children) {
            const children = item.children.filter(child =>
              !child.requiredPermission || canAccessMenu(child.requiredPermission),
            )

            // 如果父菜单没有权限，返回 null
            if (item.requiredPermission && !canAccessMenu(item.requiredPermission)) {
              return null
            }

            // 如果子菜单为空，返回 null
            if (children.length === 0) {
              return null
            }

            return {
              ...item,
              children,
            }
          }

          // 处理普通链接菜单
          if (item.requiredPermission && !canAccessMenu(item.requiredPermission)) {
            return null
          }

          return item
        })
        .filter(Boolean), // 移除 null 项
    }))
      .filter(section => section.items.length > 0) // 移除空的分组
      || []
    return arr
  })

  // 检查是否有任何菜单权限
  const hasAnyMenuAccess = computed(() => {
    return accessibleMenu.value.length > 0
  })

  return {
    accessibleMenu,
    hasAnyMenuAccess,
    fullMenuConfig,
  }
}
