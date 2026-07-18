import { useAuth } from '~/composables/useAuth'

// 路由路径到页面权限名称的映射
const PAGE_PERMISSION_MAP: Record<string, string> = {
  '/dashboard': 'overview',
  '/systems/users': 'users',
  '/systems/roles': 'roles',
  '/systems/permissions': 'permissions',
  '/systems/api-keys': 'api_keys',
}

// 免鉴权页面
const PUBLIC_ROUTES = new Set([
  '/login',
  '/settings/profile',
  '/settings/account',
  '/settings/appearance',
  '/settings/notifications',
  '/settings/display',
])

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, initAuth } = useAuth()
  const { canAccessPage } = usePermissions()

  if (import.meta.client && !isAuthenticated.value) {
    await initAuth()
  }

  if (PUBLIC_ROUTES.has(to.path)) {
    return
  }

  if (import.meta.server) {
    return
  }

  if (!isAuthenticated.value && to.path !== '/login') {
    const redirect = to.fullPath
    return navigateTo(`/login?redirect=${encodeURIComponent(redirect)}`)
  }

  const pageName = PAGE_PERMISSION_MAP[to.path]
  if (pageName && !canAccessPage(pageName)) {
    return navigateTo('/403')
  }
})
