<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { userStatusRecord } from '~/constants/constant'

const { user } = useAuth()

const userData = ref<Api.User.AddForm>({
  id: 0,
  username: '',
  role_id: '',
  role_name: '',
  status: 'active',
  last_login: '',
  lastLoginIp: '',
  forcePasswordChange: false,
  passwordChangedAt: '',
  created_at: '',
  updated_at: '',
})

// 格式化日期时间
function formatDateTime(dateTimeStr: string) {
  if (!dateTimeStr)
    return '从未登录'
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN')
}

async function getUser() {
  try {
    const data = await $fetch<{ data: Api.User.AddForm }>(`/api/systems/users/${user.value?.id}`, {
      method: 'GET',
    })
    console.log(data)
    userData.value = data.data
  }
  catch (error: any) {
    toast.error(error.data?.message || '获取用户信息失败')
  }
}

getUser()
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium">
          个人中心
        </h3>
        <p class="text-sm text-muted-foreground">
          管理系统用户账户信息
        </p>
      </div>
    </div>
  </div>
  <Separator />

  <!-- 查看模式 -->
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="flex items-center">
        <label class="text-sm font-medium">头像</label>
        <ClientOnly>
          <Avatar class="h-12 w-12 rounded-lg">
            <AvatarImage :src="user?.avatar || ''" :alt="user?.username" />
          </Avatar>
        </ClientOnly>
      </div>
      <div>
        <label class="text-sm font-medium">用户名</label>
        <p class="text-sm mt-1">
          {{ userData.username }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="text-sm font-medium">邮箱</label>
        <p class="text-sm mt-1">
          {{ userData.email || '未设置' }}
        </p>
      </div>
      <div>
        <label class="text-sm font-medium">角色</label>
        <p class="text-sm mt-1">
          {{ userData.role_name || '未分配角色' }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="text-sm font-medium">账户状态</label>
        <p class="text-sm mt-1">
          <Badge :variant="userData.status === 'active' ? 'default' : 'secondary'">
            {{ userStatusRecord[userData.status!] }}
          </Badge>
        </p>
      </div>
      <div>
        <label class="text-sm font-medium">强制修改密码</label>
        <p class="text-sm mt-1">
          <Badge :variant="userData.forcePasswordChange ? 'destructive' : 'default'">
            {{ userData.forcePasswordChange ? '是' : '否' }}
          </Badge>
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="text-sm font-medium">最后登录时间</label>
        <p class="text-sm mt-1">
          {{ userData.last_login ? formatDateTime(userData.last_login) : '--' }}
        </p>
      </div>
      <div>
        <label class="text-sm font-medium">最后登录IP</label>
        <p class="text-sm mt-1">
          {{ userData.lastLoginIp || '未知' }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="text-sm font-medium">密码最后修改时间</label>
        <p class="text-sm mt-1">
          {{ userData.passwordChangedAt ? formatDateTime(userData.passwordChangedAt) : '--' }}
        </p>
      </div>
      <div>
        <label class="text-sm font-medium">账户创建时间</label>
        <p class="text-sm mt-1">
          {{ userData.created_at ? formatDateTime(userData.created_at) : '--' }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.required::after {
  content: ' *';
  color: #ef4444;
}
</style>
