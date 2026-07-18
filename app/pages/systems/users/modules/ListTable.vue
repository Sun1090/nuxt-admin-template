<script setup lang="ts">
import { format } from 'date-fns'
import {
  LucideEdit,
  LucideKey,
  LucideMoreHorizontal,
  LucideTrash,
  LucideUserCheck,
  LucideUsers,
  LucideUserX,
} from 'lucide-vue-next'

interface Props {
  lists: Api.User.List[]
  currentUserId?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits(['edit', 'reset', 'toggle', 'delete'])

// 权限检查
const { canPerformAction } = usePermissions()

function getStatusLabel(status: string) {
  const labels: CommonType.IxpType = {
    active: '活跃',
    inactive: '停用',
    suspended: '暂停',
  }
  return labels[status] || status
}

function getStatusVariant(status: string) {
  const variants: CommonType.IxpType = {
    active: 'success',
    inactive: 'secondary',
    suspended: 'warning',
  }
  return variants[status] || 'default'
}
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>用户名</TableHead>
          <TableHead>角色</TableHead>
          <TableHead>邮箱</TableHead>
          <TableHead>电话</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>最后登录</TableHead>
          <TableHead>密码状态</TableHead>
          <TableHead class="w-20 text-right">
            操作
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="props.loading">
          <TableCell colspan="8" class="text-center py-8">
            <div class="flex justify-center">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-else-if="props.lists.length === 0">
          <TableCell colspan="8" class="text-center py-8">
            <div class="flex flex-col items-center gap-2">
              <LucideUsers class="w-12 h-12 text-gray-400" />
              <p class="text-gray-500">
                暂无用户数据
              </p>
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-for="row in props.lists" v-else :key="row.id">
          <TableCell class="font-medium">
            <div class="flex items-center gap-2">
              <span>{{ row.username }}</span>
              <Badge v-if="row.forcePasswordChange" variant="default" size="sm">
                需改密
              </Badge>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant="outline">
              {{ row.role_name || '--' }}
            </Badge>
          </TableCell>
          <TableCell class="font-medium">
            <span>{{ row.email }}</span>
          </TableCell>
          <TableCell class="font-medium">
            <span>{{ row.phone }}</span>
          </TableCell>
          <TableCell>
            <Badge :variant="getStatusVariant(row.status ?? '')">
              {{ getStatusLabel(row.status ?? '') }}
            </Badge>
          </TableCell>
          <TableCell class="text-sm text-gray-600">
            {{ row.last_login ? format(row.last_login, 'yyyy-MM-dd HH:mm:ss') : '从未登录' }}
          </TableCell>
          <TableCell>
            <Badge :variant="row.passwordChangedAt ? 'default' : 'destructive'">
              {{ row.passwordChangedAt ? '已设置' : '未设置' }}
            </Badge>
          </TableCell>
          <TableCell class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="sm">
                  <LucideMoreHorizontal class="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  v-if="canPerformAction('user', 'update')"
                  @click="emit('edit', row)"
                >
                  <LucideEdit class="w-4 h-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-if="canPerformAction('user', 'reset_password')"
                  @click="emit('reset', row)"
                >
                  <LucideKey class="w-4 h-4 mr-2" />
                  重置密码
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-if="row.status === 'active' && canPerformAction('user', 'update')"
                  @click="emit('toggle', row, 'inactive')"
                >
                  <LucideUserX class="w-4 h-4 mr-2" />
                  停用
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-if="row.status !== 'active' && canPerformAction('user', 'update')"
                  @click="emit('toggle', row, 'active')"
                >
                  <LucideUserCheck class="w-4 h-4 mr-2" />
                  启用
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  v-if="canPerformAction('user', 'delete') || row.id === currentUserId"
                  class="text-destructive"
                  @click="emit('delete', row)"
                >
                  <LucideTrash class="w-4 h-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
