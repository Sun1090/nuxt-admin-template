<script setup lang="ts">
import { format } from 'date-fns'
import {
  LucideEdit,
  LucideKey,
  LucideTrash,
  LucideUsers,
} from 'lucide-vue-next'

interface Props {
  lists: Api.Role.List[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits(['edit', 'reset', 'delete'])

// 权限检查
const { canPerformAction } = usePermissions()
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名称</TableHead>
          <TableHead>描述</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead>更新时间</TableHead>
          <TableHead class="w-20 text-right">
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

        <TableRow v-for="row in props.lists" v-else :key="row.id">
          <TableCell class="font-medium">
            <span>{{ row.name }}</span>
          </TableCell>
          <TableCell>
            {{ row.remark }}
          </TableCell>

          <TableCell>
            {{ row.created_at ? format(row.created_at, 'yyyy-MM-dd HH:mm:ss') : '--' }}
          </TableCell>
          <TableCell>
            {{ row.updated_at ? format(row.updated_at, 'yyyy-MM-dd HH:mm:ss') : '--' }}
          </TableCell>

          <TableCell class="text-right">
            <div class="flex gap-2 ml-4">
              <Button
                v-if="!row.is_superadmin && canPerformAction('role', 'update')"
                variant="outline"
                size="sm"
                class="flex items-center h-7 text-sm" @click="emit('reset', row)"
              >
                <LucideKey />
                权限
              </Button>
              <Button
                v-if="!row.is_superadmin && canPerformAction('role', 'update')"
                variant="outline"
                size="sm"
                class="flex items-center h-7 text-sm"
                @click="emit('edit', row)"
              >
                <LucideEdit />
                编辑
              </Button>
              <Button
                v-if="!row.is_superadmin && canPerformAction('role', 'delete')"
                variant="outline"
                size="sm"
                class="flex items-center h-7 text-sm text-destructive"
                @click="emit('delete', row)"
              >
                <LucideTrash />
                删除
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
