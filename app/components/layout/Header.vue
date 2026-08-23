<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const user: {
  name: string
  email: string
  avatar: string
} = {
  name: 'Dian Pratama',
  email: 'demo@example.com',
  avatar: '/avatars/avatartion.png',
}

// URL 路径段到 i18n breadcrumb key 的映射
const pathToBreadcrumbKey: Record<string, string> = {
  'dashboard': 'breadcrumb.dashboard',
  'systems': 'breadcrumb.systems',
  'users': 'breadcrumb.users',
  'roles': 'breadcrumb.roles',
  'permissions': 'breadcrumb.permissions',
  'api-keys': 'breadcrumb.apiKeys',
  'api-logs': 'breadcrumb.apiLogs',
  'email-templates': 'breadcrumb.emailTemplates',
  'notifications': 'breadcrumb.notifications',
  'database': 'breadcrumb.database',
  'backup': 'breadcrumb.backup',
  'manage': 'breadcrumb.manage',
  'settings': 'breadcrumb.settings',
  'profile': 'breadcrumb.profile',
  'account': 'breadcrumb.account',
  'appearance': 'breadcrumb.appearance',
  'display': 'breadcrumb.display',
  'user-status-logs': 'breadcrumb.userStatusLogs',
  'system-settings': 'breadcrumb.systemSettings',
  'create': 'breadcrumb.create',
  'edit': 'breadcrumb.edit',
  'detail': 'breadcrumb.detail',
}

function getBreadcrumbTitle(segment: string): string {
  const key = pathToBreadcrumbKey[segment]
  if (key) {
    return t(key)
  }
  // 对于动态路由参数，显示为"详情"
  if (segment.startsWith('[') && segment.endsWith(']')) {
    const paramName = segment.slice(1, -1)
    if (paramName === 'id') {
      return t('breadcrumb.detail')
    }
    return route.params[paramName] as string || t('breadcrumb.detail')
  }
  // 如果没有映射，使用原始路径（首字母大写）
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function setLinks() {
  if (route.fullPath === '/') {
    return [{ title: t('breadcrumb.home'), href: '/' }]
  }

  const segments = route.fullPath.split('/').filter(item => item !== '')

  const breadcrumbs = segments.map((item, index) => {
    // 跳过动态路由参数（如 [id]），但显示为"详情"
    if (item.startsWith('[') && item.endsWith(']')) {
      const paramName = item.slice(1, -1)
      const actualValue = route.params[paramName] as string

      if (paramName === 'id') {
        return {
          title: t('breadcrumb.detail'),
          href: `/${segments.slice(0, index + 1).join('/')}`,
        }
      }

      return {
        title: actualValue || t('breadcrumb.detail'),
        href: `/${segments.slice(0, index + 1).join('/')}`,
      }
    }

    const title = getBreadcrumbTitle(item)

    return {
      title,
      href: `/${segments.slice(0, index + 1).join('/')}`,
    }
  })

  return [{ title: t('breadcrumb.home'), href: '/' }, ...breadcrumbs]
}

const links = ref<{
  title: string
  href: string
}[]>(setLinks())

watch(() => route.fullPath, (val) => {
  if (val) {
    links.value = setLinks()
  }
})

// 监听路由参数变化（对于动态路由）
watch(() => route.params, () => {
  links.value = setLinks()
})
</script>

<template>
  <header class="sticky top-0 z-10 h-(--header-height) flex items-center gap-4 border-b bg-background px-4 md:px-6">
    <div class="w-full flex items-center gap-4 h-4">
      <SidebarTrigger />
      <Separator orientation="vertical" />
      <BaseBreadcrumbCustom class="hidden md:block" :links="links" />
    </div>
    <div class="ml-auto">
      <LayoutUserAvatar :user="user" />
      <slot />
    </div>
  </header>
</template>

<style scoped></style>