<script setup lang="ts">
import type { SidebarMenuButtonVariants } from '~/components/ui/sidebar'
import type { NavGroupItem } from '~/types/nav'
import { useSidebar } from '~/components/ui/sidebar'

interface Props {
  item: NavGroupItem
  size?: SidebarMenuButtonVariants['size']
  expanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  expanded: false,
})

const emit = defineEmits<{
  toggle: [id: string]
}>()

const { setOpenMobile } = useSidebar()

// 使用 prop 控制展开状态
const openCollapsible = ref(false)

// 监听 expanded prop 变化
watch(
  () => props.expanded,
  (newVal) => {
    openCollapsible.value = newVal
  },
  { immediate: true },
)

// 切换展开状态并通知父组件
function toggleCollapsible() {
  openCollapsible.value = !openCollapsible.value
  emit('toggle', props.item.id)
}

// 检查当前路由是否在子菜单中，自动展开
const route = useRoute()
const currentPath = computed(() => route.path)

// 监听路由变化，自动展开相关菜单
watchEffect(() => {
  if (props.item.children) {
    const hasActiveChild = props.item.children.some(child => child.link === currentPath.value)
    if (hasActiveChild && !openCollapsible.value) {
      openCollapsible.value = true
      emit('toggle', props.item.id)
    }
  }
})
</script>

<template>
  <SidebarMenu>
    <Collapsible :key="item.title" v-model:open="openCollapsible" as-child class="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger as-child>
          <SidebarMenuButton :tooltip="item.title" :size="size" @click="toggleCollapsible">
            <Icon :name="item.icon || ''" mode="svg" />
            <span>{{ item.title }}</span>
            <span
              v-if="item.new"
              class="rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs text-black leading-none no-underline group-hover:no-underline"
            >
              New
            </span>
            <Icon
              name="i-lucide-chevron-right"
              class="ml-auto transition-transform duration-200"
              :class="{
                'rotate-90': openCollapsible,
              }"
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem v-for="subItem in item.children" :key="subItem.title">
              <SidebarMenuSubButton as-child :data-active="subItem.link === $route.path">
                <NuxtLink :to="subItem.link" @click="setOpenMobile(false)">
                  <span>{{ subItem.title }}</span>
                  <span
                    v-if="subItem.new"
                    class="rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs text-black leading-none no-underline group-hover:no-underline"
                  >
                    New
                  </span>
                </NuxtLink>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  </SidebarMenu>
</template>
