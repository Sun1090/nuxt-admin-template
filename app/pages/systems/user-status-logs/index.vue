<script setup lang="ts">
import { format } from 'date-fns'
import { ArrowLeft, ArrowRight, History } from 'lucide-vue-next'

const { t } = useI18n()

const { pagination } = usePagination()

const queryParams = computed(() => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
}))

const { data: res, pending: loading, error, refresh } = await useAsyncData(
  'user-status-logs',
  () => $fetch('/api/systems/user-status-logs/page', { query: queryParams.value }).catch((e) => {
    console.error('加载状态变更日志失败:', e)
    throw e
  }),
)

function handlePageUpdate(newPage: number) {
  pagination.page = newPage
  refresh()
}

function statusLabel(status: string) {
  return { active: t('userStatusLog.active'), inactive: t('userStatusLog.inactive'), suspended: t('userStatusLog.suspended') }[status] || status
}

useSeoMeta({
  title: () => `${t('userStatusLog.title')} - ${t('nav.system')}`,
  description: () => t('userStatusLog.description'),
})
</script>

<template>
  <div class="container space-y-4">
    <Card class="gap-0">
      <CardHeader>
        <CardTitle>{{ t('userStatusLog.title') }}</CardTitle>
        <CardDescription>{{ t('userStatusLog.description') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex justify-center py-12">
          <div class="space-y-3 w-full">
            <Skeleton v-for="i in 8" :key="i" class="h-8 w-full" />
          </div>
        </div>
        <Alert v-else-if="error" variant="destructive" class="my-4">
          <AlertTitle>{{ t('userStatusLog.loadFailed') }}</AlertTitle>
          <AlertDescription class="flex items-center gap-2">
            无法加载状态变更日志，请检查网络连接后重试。
            <Button variant="outline" size="sm" @click="refresh">
              重试
            </Button>
          </AlertDescription>
        </Alert>
        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ t('userStatusLog.time') }}</TableHead>
                <TableHead>{{ t('userStatusLog.user') }}</TableHead>
                <TableHead>{{ t('userStatusLog.oldStatus') }}</TableHead>
                <TableHead>{{ t('userStatusLog.newStatus') }}</TableHead>
                <TableHead>{{ t('userStatusLog.reason') }}</TableHead>
                <TableHead>{{ t('userStatusLog.operator') }}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="log in res?.data || []" :key="log.id">
                <TableCell class="text-xs whitespace-nowrap text-muted-foreground">
                  {{ log.createdAt ? format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss') : '-' }}
                </TableCell>
                <TableCell class="font-medium">
                  {{ log.username || t('userStatusLog.unknown') }}
                </TableCell>
                <TableCell>
                  <Badge v-if="log.oldStatus" variant="secondary" class="text-xs">
                    {{ statusLabel(log.oldStatus) }}
                  </Badge>
                  <span v-else class="text-xs text-muted-foreground">-</span>
                </TableCell>
                <TableCell>
                  <Badge :variant="log.newStatus === 'active' ? 'default' : 'destructive'" class="text-xs">
                    {{ statusLabel(log.newStatus) }}
                  </Badge>
                </TableCell>
                <TableCell class="max-w-40 truncate text-xs text-muted-foreground">
                  {{ log.reason || '-' }}
                </TableCell>
                <TableCell class="text-xs text-muted-foreground">
                  {{ log.operatorName || '-' }}
                </TableCell>
              </TableRow>
              <TableRow v-if="!res?.data?.length">
                <TableCell colspan="6" class="py-8">
                  <Empty>
                    <History class="size-10 text-muted-foreground" />
                    <p class="text-sm text-muted-foreground">
                      {{ t('userStatusLog.noRecords') }}
                    </p>
                  </Empty>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <Pagination
      v-if="(res?.pagination?.total ?? 0) > 0"
      v-slot="{ page }"
      class="justify-end"
      :items-per-page="pagination.pageSize"
      :total="res?.pagination?.total ?? 0"
      :sibling-count="1"
      :default-page="pagination.page"
      @update:page="handlePageUpdate"
    >
      <PaginationContent v-slot="{ items }">
        <PaginationPrevious><ArrowLeft /></PaginationPrevious>
        <template v-for="(item, index) in items" :key="index">
          <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">
            {{ item.value }}
          </PaginationItem>
          <PaginationEllipsis v-else-if="item.type === 'ellipsis'" :index="index" />
        </template>
        <PaginationNext><ArrowRight /></PaginationNext>
      </PaginationContent>
    </Pagination>
  </div>
</template>
