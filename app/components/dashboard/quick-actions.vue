<script setup lang="ts">
const { canAccessPage } = usePermissions()

const actions = [
  {
    label: '用户管理',
    icon: 'user-cog',
    path: '/systems/users',
    resource: 'users',
    color: 'blue',
  },
  {
    label: '角色管理',
    icon: 'shield',
    path: '/systems/roles',
    resource: 'roles',
    color: 'green',
  },
  {
    label: '权限管理',
    icon: 'key',
    path: '/systems/permissions',
    resource: 'permissions',
    color: 'orange',
  },
  {
    label: 'API 密钥',
    icon: 'key-round',
    path: '/systems/api-keys',
    resource: 'api_keys',
    color: 'purple',
  },
]
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>快速操作</CardTitle>
    </CardHeader>
    <CardContent class="space-y-2">
      <Button
        v-for="action in actions.filter(a => canAccessPage(a.resource))"
        :key="action.label"
        variant="outline"
        class="w-full justify-start h-auto py-3"
        @click="navigateTo(action.path)"
      >
        <Icon :name="`i-lucide-${action.icon}`" class="mr-2 h-4 w-4" />
        {{ action.label }}
      </Button>
    </CardContent>
  </Card>
</template>
