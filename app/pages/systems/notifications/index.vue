<script setup lang="ts">
import { format } from 'date-fns'
import { ArrowLeft, ArrowRight, BellOff, CheckCheck } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const { t } = useI18n()

const { pagination } = usePagination()

const filter = ref<'all' | 'unread' | 'read'>('all')

const queryParams = computed(() => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
  read: filter.value === 'all' ? '' : filter.value,
}))

const { data: res, pending: loading, error, refresh } = await useAsyncData(
  'notifications',
  () => $fetch('/api/notifications', { query: queryParams.value }).catch((e) => {
    console.error('加载通知失败:', e)
    throw e
  }),
)

async function markAsRead(notification: any) {
  if (notification.read)
    return
  try {
    await $fetch(`/api/notifications/${notification.id}`, {
      method: 'PUT',
      body: { read: true },
    })
    refresh()
  }
  catch {
    toast.error(t('notification.markReadFailed'))
  }
}

async function markAllAsRead() {
  try {
    await $fetch('/api/notifications/read-all', { method: 'POST' })
    toast.success('已全部标记为已读')
    refresh()
  }
  catch {
    toast.error(t('notification.operationFailed'))
  }
}

function handlePageUpdate(newPage: number) {
  pagination.page = newPage
  refresh()
}

function switchFilter(newFilter: 'all' | 'unread' | 'read') {
  filter.value = newFilter
  pagination.page = 1
  refresh()
}

function notificationIcon(type: string) {
  if (type === 'INFO')
    return 'i-lucide-info'
  if (type === 'WARNING')
    return 'i-lucide-alert-triangle'
  if (type === 'ERROR')
    return 'i-lucide-x-circle'
  if (type === 'SYSTEM')
    return 'i-lucide-bell'
  return 'i-lucide-megaphone'
}

function notificationTypeLabel(type: string) {
  const labels: Record<string, string> = {
    INFO: t('notification.typeInfo'),
    WARNING: t('notification.typeWarning'),
    ERROR: t('notification.typeError'),
    SYSTEM: t('notification.typeSystem'),
  }
  return labels[type] || type
}

useSeoMeta({
  title: () => `${t('notification.title')} - ${t('nav.system')}`,
  description: () => t('notification.description'),
})
</script>

<template>
  <div class="container space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold tracking-tight">
          {{ t('notification.title') }}
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ t('notification.description') }}
        </p>
      </div>
      <Button variant="outline" size="sm" class="h-8 gap-1.5" @click="markAllAsRead">
        <CheckCheck class="size-3.5" />
        {{ t('notification.markAllAsRead') }}
      </Button>
    </div>

    <div class="flex items-center gap-2">
      <Button
        v-for="option in ([{ label: t('common.all'), value: 'all' }, { label: t('notification.unread'), value: 'unread' }, { label: t('notification.read'), value: 'read' }] as const)"
        :key="option.value"
        :variant="filter === option.value ? 'default' : 'outline'"
        size="sm"
        class="h-7"
        @click="switchFilter(option.value)"
      >
        {{ option.label }}
      </Button>
    </div>

    <Card class="gap-0">
      <CardContent class="p-0">
        <div v-if="loading" class="flex justify-center py-12">
          <div class="space-y-2 w-full px-4">
            <Skeleton v-for="i in 6" :key="i" class="h-14 w-full" />
          </div>
        </div>
        <Alert v-else-if="error" variant="destructive" class="m-4">
          <AlertTitle>{{ t('common.error') }}</AlertTitle>
          <AlertDescription class="flex items-center gap-2">
            无法加载通知，请检查网络连接后重试。
            <Button variant="outline" size="sm" @click="refresh">
              重试
            </Button>
          </AlertDescription>
        </Alert>
        <div v-else-if="!res?.data?.length" class="py-12">
          <Empty>
            <BellOff class="size-10 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">
              {{ t('notification.noNotifications') }}
            </p>
          </Empty>
        </div>
        <div v-else class="divide-y">
          <div
            v-for="item in res.data"
            :key="item.id"
            class="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50 cursor-pointer"
            :class="{ 'bg-muted/30': !item.read }"
            @click="markAsRead(item)"
          >
            <div class="mt-0.5 shrink-0">
              <div
                class="flex size-8 items-center justify-center rounded-full"
                :class="item.read ? 'bg-muted' : 'bg-primary/10'"
              >
                <Icon :name="notificationIcon(item.type)" class="size-4" :class="item.read ? 'text-muted-foreground' : 'text-primary'" />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-muted-foreground">{{ notificationTypeLabel(item.type) }}</span>
                <span v-if="!item.read" class="size-1.5 rounded-full bg-primary shrink-0" />
              </div>
              <p class="text-sm mt-0.5 line-clamp-2">
                {{ item.message }}
              </p>
              <p class="text-xs text-muted-foreground mt-1">
                {{ item.createdAt ? format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm:ss') : '-' }}
              </p>
            </div>
            <div class="shrink-0 mt-1">
              <Icon v-if="item.read" name="i-lucide-mail" class="size-4 text-muted-foreground/50" />
              <Icon v-else name="i-lucide-mail-open" class="size-4 text-primary" />
            </div>
          </div>
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
