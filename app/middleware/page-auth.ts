export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()
  const { canAccessPage } = usePermissions()

  const getPageNameFromPath = (path: string): string => {
    const matches: Record<string, string> = {
      '/dashboard': 'overview',
      '/systems/users': 'users',
      '/systems/roles': 'roles',
      '/systems/permissions': 'permissions',
      '/systems/api-keys': 'api_keys',
      '/systems/settings': 'settings',
    }
    return matches[path] || path.replace('/', '')
  }

  const pageName = getPageNameFromPath(to.path)
  if (isAuthenticated.value && !canAccessPage(pageName)) {
    return navigateTo('/401')
  }
})
