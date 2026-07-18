// 基础导航项接口
export interface BaseNavItem {
  title: string
  icon?: string
  link?: string
  constant?: boolean
  requiredPermission?: string
  isDynamic?: boolean // 是否为动态路由
  hideInMenu?: boolean // 是否在菜单中隐藏
  children?: NavItem[]
  badge?: string | number
}

// 可点击的导航项（有链接）
export interface NavLinkItem extends BaseNavItem {
  link: string
  children?: never // 确保有链接的项不能有子项
}

// 分组导航项（有子菜单）
export interface NavGroupItem extends BaseNavItem {
  link?: never // 确保分组项不能有链接
  children: NavLinkItem[] // 子项必须是可点击的
}

// 导航项可以是链接或分组
export type NavItem = NavLinkItem | NavGroupItem

// 导航菜单段
export interface NavMenu {
  heading: string
  constant?: boolean
  items: NavItem[]
}

// 权限分类接口
export interface PermissionsByCategory {
  pages: string[]
  menus: string[]
  features: string[]
  actions: Array<{
    resource: string
    action: string
  }>
}
