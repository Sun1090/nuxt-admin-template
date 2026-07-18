<script setup lang="ts">
import {
  LucideEdit,
  LucideEye,
  LucideMoreHorizontal,
} from 'lucide-vue-next'

interface Props {
  lists: Api.ApiKeys.List[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})
const emit = defineEmits(['edit', 'add', 'view', 'delete'])

function getStatusText(status: string) {
  const statusMap: CommonType.IxpType = {
    active: '活跃',
    inactive: '非活跃',
    expired: '已过期',
  }
  return statusMap[status] || status
}
function getStatusVariant(status: string) {
  const variants: CommonType.IxpType = {
    active: 'default',
    inactive: 'secondary',
    expired: 'destructive',
  }
  return variants[status] || 'default'
}

function formatDate(dateString: string) {
  if (!dateString)
    return ''
  return new Date(dateString).toLocaleString('zh-CN')
}
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1)
    return '刚刚'
  if (diffInHours < 24)
    return `${diffInHours}小时前`
  return `${Math.floor(diffInHours / 24)}天前`
}
// 权限检查
const { canPerformAction } = usePermissions()
</script>

<template>
  <div class="rounded-md border">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <LucideLoader2 class="w-8 h-8 animate-spin text-primary" />
      <span class="ml-2 text-gray-600">加载中...</span>
    </div>

    <!-- 空状态 -->
    <div v-else-if="lists.length === 0" class="text-center py-12">
      <LucideKey class="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-semibold mb-2">
        暂无API密钥
      </h3>
      <p class="text-gray-500 mb-4">
        还没有创建任何API密钥，点击上方按钮创建第一个密钥
      </p>
      <Button @click="emit('add')">
        <LucidePlus />
        创建API密钥
      </Button>
    </div>

    <!-- API密钥表格 -->
    <div v-else>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>密钥前缀</TableHead>
            <TableHead>创建者</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>过期时间</TableHead>
            <TableHead>调用次数</TableHead>
            <TableHead class="text-right">
              操作
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in lists || []" :key="row.id">
            <TableCell class="font-medium">
              <div class="flex items-center gap-2">
                <span>{{ row.name }}</span>
                <Badge v-if="row.isExpired" variant="destructive" size="sm">
                  已过期
                </Badge>
              </div>
              <p v-if="row.remark" class="text-sm text-gray-500 mt-1">
                {{ row.remark }}
              </p>
            </TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(row.status)">
                {{ getStatusText(row.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <code class="text-xs px-2 py-1 rounded">{{ row.keyPrefix }}</code>
            </TableCell>
            <TableCell>
              {{ row.creatorName || '--' }}
            </TableCell>
            <TableCell class="text-sm text-gray-600">
              {{ formatDate(row.createdAt) }}
            </TableCell>
            <TableCell>
              <span v-if="row.expiresAt" :class="{ 'text-red-500': row.isExpired }" class="text-sm">
                {{ formatDate(row.expiresAt) }}
              </span>
              <span v-else class="text-sm text-gray-400">永不过期</span>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <span class="text-sm">{{ row.usageCount || 0 }}</span>
                <span v-if="row.lastUsedAt" class="text-xs text-gray-500">
                  (最后: {{ formatRelativeTime(row.lastUsedAt) }})
                </span>
              </div>
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
                    v-if="canPerformAction('api_key', 'read')"
                    @click="emit('view', row)"
                  >
                    <LucideEye />
                    查看详情
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    v-if="canPerformAction('api_key', 'update')"
                    @click="emit('edit', row)"
                  >
                    <LucideEdit />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    v-if="canPerformAction('api_key', 'delete')"
                    class="text-destructive"
                    @click="emit('delete', row)"
                  >
                    <LucideTrash2 />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
