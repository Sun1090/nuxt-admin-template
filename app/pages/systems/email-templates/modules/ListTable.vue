<script setup lang="ts">
import { format } from 'date-fns'
import { LucideEdit, LucideTrash2 } from 'lucide-vue-next'

defineProps<{
  lists: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  edit: [row: any]
  delete: [row: any]
}>()

const { t } = useI18n()
</script>

<template>
  <div v-if="loading" class="flex justify-center py-12">
    <div class="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
  <Table v-else>
    <TableHeader>
      <TableRow>
        <TableHead>标识</TableHead>
        <TableHead>名称</TableHead>
        <TableHead>邮件主题</TableHead>
        <TableHead>更新时间</TableHead>
        <TableHead class="w-20 text-right">
          操作
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="item in lists" :key="item.id">
        <TableCell class="font-mono text-xs">
          {{ item.key }}
        </TableCell>
        <TableCell class="font-medium">
          {{ item.name }}
        </TableCell>
        <TableCell class="max-w-xs truncate text-muted-foreground">
          {{ item.subject }}
        </TableCell>
        <TableCell class="text-muted-foreground">
          {{ item.updatedAt ? format(new Date(item.updatedAt), 'yyyy-MM-dd HH:mm') : '-' }}
        </TableCell>
        <TableCell class="text-right">
          <div class="flex justify-end gap-1">
            <Button variant="ghost" size="icon" class="size-8" @click="emit('edit', item)">
              <LucideEdit class="size-4" />
            </Button>
            <Button variant="ghost" size="icon" class="size-8 text-destructive" @click="emit('delete', item)">
              <LucideTrash2 class="size-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      <TableRow v-if="!lists.length">
        <TableCell colspan="5" class="text-center text-muted-foreground py-8">
          暂无邮件模板，点击"新增"添加
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
