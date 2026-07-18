<script setup lang="ts">
const route = useRoute()

const user: {
  name: string
  email: string
  avatar: string
} = {
  name: 'Dian Pratama',
  email: 'demo@example.com',
  avatar: '/avatars/avatartion.png',
}

// 完整的路径到中文标题映射
const pathToChineseMap: Record<string, string> = {
  // 仪表盘
  'dashboard': '仪表盘',

  // 系统管理
  'systems': '系统管理',
  'users': '用户管理',
  'roles': '角色管理',
  'permissions': '权限管理',
  'api-keys': 'API密钥',
  'database': '数据库',
  'backup': '备份',
  'manage': '管理',
  'settings': '设置',
  'profile': '个人资料',
  'account': '用户',
  'appearance': '外观',
  // 通用词汇
  'create': '新建',
  'edit': '编辑',
  'detail': '详情',
  'id': 'ID',
}

function setLinks() {
  if (route.fullPath === '/') {
    return [{ title: '首页', href: '/' }]
  }

  const segments = route.fullPath.split('/').filter(item => item !== '')

  const breadcrumbs = segments.map((item, index) => {
    // 跳过动态路由参数（如 [id]）
    if (item.startsWith('[') && item.endsWith(']')) {
      const paramName = item.slice(1, -1)
      const actualValue = route.params[paramName] as string

      // 如果是ID参数，显示为"详情"
      if (paramName === 'id') {
        return {
          title: '详情',
          href: `/${segments.slice(0, index + 1).join('/')}`,
        }
      }

      // 其他参数显示实际值
      return {
        title: actualValue || '详情',
        href: `/${segments.slice(0, index + 1).join('/')}`,
      }
    }

    // 将路径转换为中文标题
    let title = pathToChineseMap[item] || item

    // 如果没有映射，尝试将连字符分隔的单词转换为中文
    if (!pathToChineseMap[item] && item.includes('-')) {
      const words = item.split('-')
      title = words.map(word => pathToChineseMap[word] || word).join('')
    }

    // 如果没有映射，使用原始路径（首字母大写）
    if (title === item) {
      title = item
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }

    return {
      title,
      href: `/${segments.slice(0, index + 1).join('/')}`,
    }
  })

  return [{ title: '首页', href: '/' }, ...breadcrumbs]
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
