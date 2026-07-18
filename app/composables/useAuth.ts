import { navigateTo, useState } from '#app'
import { lorelei } from '@dicebear/collection'
import { createAvatar } from '@dicebear/core'
import { processPermissions } from '~/utils/menuUtils'

export function useAuth() {
  const user = useState<Api.Auth.User | null>('user', () => null)
  const token = useState<string | null>('token', () => null)
  const isAuthenticated = useState<boolean>('isAuthenticated', () => false)
  const hasAdminAccess = useState<boolean>('hasAdminAccess', () => false)
  const loading = useState<boolean>('loading', () => false)
  const avatar = createAvatar(lorelei, {
    size: 128,
  }).toDataUri()
  // 计算属性：按类别分组的权限
  const permissionsByCategory = computed(() => {
    if (!user.value?.permissionNames) {
      return {
        pages: [],
        menus: [],
        features: [],
        actions: [],
      }
    }
    return processPermissions(user.value.permissionNames)
  })

  // 权限检查方法 - 直接在 useAuth 中实现
  const checkHasAdminAccess = (): boolean => {
    return permissionsByCategory.value.features.includes('feature:admin_access')
  }

  const canAccessPage = (pageName: string): boolean => {
    if (!user.value)
      return false
    return permissionsByCategory.value.pages.includes(`page:${pageName}`)
  }

  const canAccessMenu = (menuName: string): boolean => {
    if (!user.value)
      return false
    return permissionsByCategory.value.menus.includes(`menu:${menuName}`)
  }

  const canPerformAction = (resource: string, action: string): boolean => {
    if (!user.value)
      return false
    return permissionsByCategory.value.actions.some(
      a => a.resource === resource && a.action === action,
    )
  }

  const getAccessiblePages = (): string[] => {
    return permissionsByCategory.value.pages.map(p => p.replace('page:', ''))
  }

  const getAccessibleMenus = (): string[] => {
    return permissionsByCategory.value.menus.map(m => m.replace('menu:', ''))
  }

  const clearAuthState = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    hasAdminAccess.value = false
  }

  const initAuth = async () => {
    // 客户端执行
    if (typeof window === 'undefined' || import.meta.server) {
      return null
    }

    // 已认证跳过，但仍返回用户信息
    if (isAuthenticated.value && user.value) {
      return user.value
    }

    try {
      const data = await $fetch<{ user: Api.Auth.User }>('/api/auth/verify')

      if (data && data.user) {
        user.value = { ...data.user, avatar }
        isAuthenticated.value = true
        token.value = 'cookie-based'
        hasAdminAccess.value = checkHasAdminAccess() // 更新管理员权限状态
        return { ...data.user, avatar }
      }
      else {
        clearAuthState()
        return null
      }
    }
    catch {
      clearAuthState()
      return null
    }
  }

  const login = async (username: string, password: string) => {
    const response = await $fetch<{ success: boolean, user: Api.Auth.User }>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })

    if (response.success && response.user) {
      token.value = 'cookie-based'
      user.value = { ...response.user, avatar }
      isAuthenticated.value = true
      hasAdminAccess.value = checkHasAdminAccess() // 更新管理员权限状态
      return response
    }
    else {
      throw new Error('登录响应格式错误')
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    loading.value = true
    try {
      await $fetch('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      })
    }
    catch (error: any) {
      if (error.data && error.data.statusMessage) {
        throw new Error(error.data.statusMessage)
      }
      else if (error.data && error.data.message) {
        throw new Error(error.data.message)
      }
      else if (error.statusMessage) {
        throw new Error(error.statusMessage)
      }
      else if (error.message) {
        throw new Error(error.message)
      }
      else {
        throw new Error('密码修改失败，请重试')
      }
    }
    finally {
      loading.value = false
    }
  }

  const setInitialPassword = async (newPassword: string) => {
    loading.value = true
    try {
      await $fetch('/api/auth/set-initial-password', {
        method: 'POST',
        body: { newPassword },
      })
      if (user.value) {
        user.value.needsPasswordChange = false
      }
    }
    finally {
      loading.value = false
    }
  }

  const refreshUser = async () => {
    const data = await $fetch<{ user: Api.Auth.User }>('/api/auth/verify')
    if (data && data.user) {
      user.value = { ...data.user, avatar }
      isAuthenticated.value = true
      hasAdminAccess.value = checkHasAdminAccess()
    }
  }

  const logout = async (redirect = true) => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    }
    catch {
      // 忽略登出错误
    }

    clearAuthState()

    if (import.meta.client && redirect) {
      await navigateTo('/login')
    }
  }

  const getAuthConfig = () => {
    return {
      credentials: 'include' as RequestCredentials,
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated: readonly(isAuthenticated),
    hasAdminAccess: readonly(hasAdminAccess),
    loading: readonly(loading),
    permissionsByCategory: readonly(permissionsByCategory),
    // 权限检查方法
    canAccessPage,
    canAccessMenu,
    canPerformAction,
    getAccessiblePages,
    getAccessibleMenus,
    checkHasAdminAccess,
    // 认证方法
    login,
    logout,
    changePassword,
    setInitialPassword,
    refreshUser,
    initAuth,
    getAuthConfig,
  }
}
