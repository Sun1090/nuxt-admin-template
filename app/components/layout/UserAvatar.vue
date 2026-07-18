<script setup lang="ts">
import { LucideLoader2 } from 'lucide-vue-next'
import { useSidebar } from '~/components/ui/sidebar'

defineProps<{
  user: {
    name: string
    email: string
    avatar: string
  }
}>()
const loading = ref(false)

const { isMobile, setOpenMobile } = useSidebar()
const { logout, user } = useAuth()
function handleLogout() {
  loading.value = true
  logout()
  loading.value = false
}

const showModalTheme = ref(false)
const showLogout = ref(false)
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <ClientOnly>
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="user?.avatar || ''" :alt="user?.username" />
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span>{{ user?.username }}</span>
              </div>
            </ClientOnly>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="min-w-56 w-[--radix-dropdown-menu-trigger-width] rounded-lg"
          :side="isMobile ? 'bottom' : 'bottom'"
          align="end"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="user?.avatar ?? ''" :alt="user?.username" />
                <AvatarFallback class="rounded-lg">
                  {{ user?.username.split(' ').map((n) => n[0]).join('') }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ user?.username }}</span>
                <span class="truncate text-xs">{{ user?.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <NuxtLink to="/settings/profile">
                <Icon name="i-lucide-badge-check" />
                个人中心
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NuxtLink to="/settings/appearance" @click="setOpenMobile(false)">
                <Icon name="i-lucide-settings" />
                设置
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="i-lucide-bell" />
              通知
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="showModalTheme = true">
              <Icon name="i-lucide-paintbrush" />
              主题
            </DropdownMenuItem>
            <DropdownMenuItem @click="showLogout = true">
              <Icon name="i-lucide-log-out" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>

  <Dialog v-model:open="showModalTheme">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Customize</DialogTitle>
        <DialogDescription class="text-xs text-muted-foreground">
          自定义和实时预览
        </DialogDescription>
      </DialogHeader>
      <ThemeCustomize />
    </DialogContent>
  </Dialog>
  <Dialog v-model:open="showLogout">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>系统提示</DialogTitle>
        <DialogDescription>
          确认退出登录吗？
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="justify-end">
        <DialogClose as-child>
          <Button variant="outline">
            取消
          </Button>
        </DialogClose>
        <Button type="submit" :disabled="loading" @click="handleLogout">
          <LucideLoader2 v-if="loading" class="h-4animate-spin" />
          确定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>

</style>
