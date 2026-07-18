<script setup lang="ts">
import { format } from 'date-fns'
import {
  LucideEdit,
  LucideMoreHorizontal,
  LucideTrash,
  LucideUsers,
} from 'lucide-vue-next'
import { categoryRecord } from '~/constants/constant'

interface Props {
  lists: Api.Permission.List[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits(['edit', 'reset', 'delete'])

function getCategoryVariant(category: string) {
  const variants: CommonType.IxpType = {
    page: 'default',
    menu: 'secondary',
    action: 'outline',
    feature: 'success',
  }
  return variants[category] || 'default'
}
function isSystemPermission(permission: Api.Permission.List) {
  // 系统权限通常是基础权限，不允许删除
  const systemPermissions = ['feature:admin_access', 'page:dashboard', 'menu:dashboard']
  return systemPermissions.includes(permission.name)
}
// 权限检查
const { canPerformAction } = usePermissions()
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名称</TableHead>
          <TableHead>分类</TableHead>
          <TableHead>资源</TableHead>
          <TableHead>操作</TableHead>
          <TableHead>描述</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead>更新时间</TableHead>
          <TableHead class="text-right">
            操作
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow v-if="props.loading">
          <TableCell colspan="7" class="text-center py-8">
            <div class="flex justify-center">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-else-if="props.lists.length === 0">
          <TableCell colspan="7" class="text-center py-8">
            <div class="flex flex-col items-center gap-2">
              <LucideUsers class="w-12 h-12 text-gray-400" />
              <p class="text-gray-500">
                暂无用户数据
              </p>
            </div>
          </TableCell>
        </TableRow>
        <TableRow v-for="row in lists" v-else :key="row.id">
          <TableCell class="font-medium">
            <div class="flex items-center gap-2">
              <span>{{ row.name }}</span>
              <Badge v-if="isSystemPermission(row)" variant="secondary" size="sm">
                系统
              </Badge>
            </div>
          </TableCell>
          <TableCell>
            <Badge :variant="getCategoryVariant(row.category)">
              {{ categoryRecord[row.category] }}
            </Badge>
          </TableCell>
          <TableCell>
            <span v-if="row.resource" class="font-mono text-sm">
              {{ row.resource }}
            </span>
            <span v-else class="text-gray-400">-</span>
          </TableCell>
          <TableCell>
            <span v-if="row.action" class="font-mono text-sm">
              {{ row.action }}
            </span>
            <span v-else class="text-gray-400">-</span>
          </TableCell>
          <TableCell class="max-w-xs">
            <Tooltip>
              <TooltipTrigger as-child>
                <span class="truncate block">
                  {{ row.remark }}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {{ row.remark }}
              </TooltipContent>
            </Tooltip>
          </TableCell>
          <TableCell>
            {{ row.created_at ? format(row.created_at, 'yyyy-MM-dd HH:mm:ss') : '--' }}
          </TableCell>
          <TableCell>
            {{ row.updated_at ? format(row.updated_at, 'yyyy-MM-dd HH:mm:ss') : '--' }}
          </TableCell>
          <TableCell class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="sm">
                  <LucideMoreHorizontal class="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem v-if="canPerformAction('permission', 'update')" @click="emit('edit', row)">
                  <LucideEdit class="w-4 h-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-if="isSystemPermission(row) && !canPerformAction('permission', 'delete')"
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
