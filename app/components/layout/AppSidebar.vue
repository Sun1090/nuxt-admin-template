<script setup lang="ts">
import type { NavItem, NavLinkItem, NavMenu } from '~/types/nav'
import { useAuth } from '~/composables/useAuth'
import { getAccessibleMenus } from '~/utils/menuUtils'

const { user, permissionsByCategory } = useAuth()

const accessibleMenus = computed(() => {
  if (!user.value)
    return []
  const menuPermissions = permissionsByCategory.value.menus
  return getAccessibleMenus(menuPermissions)
})

// 使用本地存储保持展开状态，确保始终是 Set 对象
const expandedMenusStorage = useLocalStorage<string[]>('sidebar-expanded-menus', [])
const expandedMenus = ref<Set<string>>(new Set())

// 同步 localStorage 到 Set
function syncExpandedMenus() {
  const stored = expandedMenusStorage.value
  if (Array.isArray(stored)) {
    expandedMenus.value = new Set(stored)
  }
  else {
    expandedMenus.value = new Set()
  }
}

// 保存到 localStorage
function saveToStorage() {
  expandedMenusStorage.value = Array.from(expandedMenus.value)
}

// 根据当前路由自动展开相关菜单
const route = useRoute()
function autoExpandMenusBasedOnRoute() {
  const currentPath = route.path
  console.log(accessibleMenus.value)
  accessibleMenus.value.forEach((navGroup) => {
    navGroup.items.forEach((item) => {
      if ('children' in item) {
        const hasActiveChild = item?.children?.some(child => 'link' in child && currentPath.startsWith(child.link)) || false
        if (hasActiveChild) {
          expandedMenus.value.add(item.link ?? '')
        }
      }
    })
  })
  saveToStorage()
}

// 初始化时同步并自动展开
onMounted(() => {
  syncExpandedMenus()
  autoExpandMenusBasedOnRoute()
})

// 监听路由变化
watch(
  () => route.path,
  () => {
    autoExpandMenusBasedOnRoute()
  },
)

// 切换菜单展开状态
function toggleMenu(menuId: string) {
  if (expandedMenus.value.has(menuId)) {
    expandedMenus.value.delete(menuId)
  }
  else {
    expandedMenus.value.add(menuId)
  }
  saveToStorage()
}

// 检查菜单是否展开
function isMenuExpanded(menuId: string): boolean {
  return expandedMenus.value.has(menuId)
}

function resolveNavItemComponent(item: NavLinkItem | NavItem | NavMenu): any {
  if ('children' in item)
    return resolveComponent('LayoutSidebarNavGroup')
  return resolveComponent('LayoutSidebarNavLink')
}

const { sidebar } = useAppSettings()
</script>

<template>
  <Sidebar :collapsible="sidebar?.collapsible" :side="sidebar?.side" :variant="sidebar?.variant">
    <SidebarHeader>
      <LayoutSidebarNavHeader />
    </SidebarHeader>
    <SidebarContent>
      <ClientOnly>
        <SidebarGroup v-for="(nav, indexGroup) in accessibleMenus" :key="indexGroup">
          <SidebarGroupLabel v-if="nav.heading">
            {{ nav.heading }}
          </SidebarGroupLabel>

          <component
            :is="resolveNavItemComponent(item)"
            v-for="(item, index) in nav.items"
            :key="index"
            :item="item"
            :expanded="isMenuExpanded(item.link ?? '')"
            @toggle="toggleMenu(item.link ?? '')"
          />
        </SidebarGroup>
      </ClientOnly>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
