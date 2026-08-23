<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { AlertCircle, Users, UserX } from 'lucide-vue-next'

const { t, locale } = useI18n()
const { data: stats, pending: loading, error, refresh } = useAsyncData(
  'dashboard-stats',
  () => $fetch('/api/dashboard/stats'),
)

const dateLocale = computed(() => locale.value === 'zh-CN' ? zhCN : enUS)

function formatTime(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: dateLocale.value })
  }
  catch {
    return '-'
  }
}

function statusLabel(status: string) {
  const key = status === 'active' ? 'user.active' : status === 'inactive' ? 'user.inactive' : status === 'suspended' ? 'user.suspended' : null
  return key ? t(key) : status
}
</script>

<template>
  <Card class="gap-0">
    <CardHeader class="flex-row items-center justify-between pb-3">
      <div class="flex items-center gap-2">
        <Users class="size-4 text-muted-foreground" />
        <CardTitle class="text-base">
          {{ t('dashboard.recentUsers') }}
        </CardTitle>
      </div>
      <NuxtLink to="/systems/users" class="text-xs text-primary hover:underline">
        {{ t('dashboard.viewAll') }}
      </NuxtLink>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="space-y-3">
        <Skeleton v-for="i in 5" :key="i" class="h-12 w-full rounded-lg" />
      </div>
      <Alert v-else-if="error" variant="destructive" class="my-2">
        <AlertCircle class="size-4" />
        <AlertTitle>{{ t('common.error') }}</AlertTitle>
        <AlertDescription class="flex items-center gap-2">
          {{ t('app.loading') }}
          <Button variant="outline" size="sm" @click="refresh">
            {{ t('common.refresh') }}
          </Button>
        </AlertDescription>
      </Alert>
      <Empty v-else-if="!stats?.recentUsers?.length">
        <UserX class="size-8 text-muted-foreground" />
        <p class="text-sm text-muted-foreground">
          {{ t('common.noData') }}
        </p>
      </Empty>
      <div v-else class="space-y-1">
        <div
          v-for="u in stats.recentUsers"
          :key="u.id"
          class="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-accent"
        >
          <div class="flex items-center gap-3">
            <Avatar class="size-8">
              <AvatarFallback>{{ u.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
            </Avatar>
            <div>
              <p class="text-sm font-medium">
                {{ u.username }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ u.name || '-' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Badge :variant="u.status === 'active' ? 'default' : 'secondary'" class="text-xs">
              {{ statusLabel(u.status) }}
            </Badge>
            <span class="text-xs text-muted-foreground">{{ formatTime(u.created_at) }}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
