<script setup lang="ts">
import { format } from 'date-fns'
import { ArrowLeft, ArrowRight, LucideDownload, LucideRefreshCw, LucideSearch, SearchX } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const { t } = useI18n()

const { pagination } = usePagination()

const searchParams = reactive({
  endpoint: '',
  method: '',
  statusCode: '',
})

const queryParams = computed(() => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
  endpoint: searchParams.endpoint,
  method: searchParams.method,
  statusCode: searchParams.statusCode,
}))

const { data: res, pending: loading, error, refresh } = await useAsyncData(
  'api-logs',
  () => $fetch('/api/systems/api-logs/page', { query: queryParams.value }).catch((e) => {
    console.error('加载API日志失败:', e)
    throw e
  }),
)

function resetSearch() {
  Object.assign(searchParams, { endpoint: '', method: '', statusCode: '' })
  pagination.page = 1
  refresh()
}

function handlePageUpdate(newPage: number) {
  pagination.page = newPage
  refresh()
}

const exportLoading = ref(false)
async function handleExport() {
  exportLoading.value = true
  try {
    const params = new URLSearchParams()
    if (searchParams.endpoint)
      params.set('endpoint', searchParams.endpoint)
    if (searchParams.method)
      params.set('method', searchParams.method)
    if (searchParams.statusCode)
      params.set('statusCode', searchParams.statusCode)
    const url = `/api/systems/api-logs/export${params.toString() ? `?${params.toString()}` : ''}`
    const blob = await $fetch<Blob>(url, { responseType: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `api-logs-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('导出成功')
  }
  catch (err: any) {
    toast.error(err?.data?.message || err?.message || '导出失败')
  }
  finally {
    exportLoading.value = false
  }
}

function statusBadgeVariant(code: number) {
  if (code < 300)
    return 'default'
  if (code < 400)
    return 'secondary'
  if (code < 500)
    return 'outline'
  return 'destructive'
}

useSeoMeta({
  title: 'API 访问日志 - 系统管理',
  description: '查看API密钥访问记录',
})
</script>

<template>
  <div class="container space-y-4">
    <Card class="gap-0">
      <CardHeader>
        <CardTitle>API 访问日志</CardTitle>
        <CardDescription>查看所有API密钥的访问记录和请求详情</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <div class="flex items-center gap-2">
            <Input v-model="searchParams.endpoint" placeholder="搜索接口路径" class="w-48 h-8 text-sm" />
            <Select v-model="searchParams.method">
              <SelectTrigger class="w-24 h-8">
                <SelectValue placeholder="方法" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  全部
                </SelectItem>
                <SelectItem value="GET">
                  GET
                </SelectItem>
                <SelectItem value="POST">
                  POST
                </SelectItem>
                <SelectItem value="PUT">
                  PUT
                </SelectItem>
                <SelectItem value="DELETE">
                  DELETE
                </SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="searchParams.statusCode">
              <SelectTrigger class="w-28 h-8">
                <SelectValue placeholder="状态码" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  全部
                </SelectItem>
                <SelectItem value="200">
                  2xx 成功
                </SelectItem>
                <SelectItem value="400">
                  4xx 错误
                </SelectItem>
                <SelectItem value="500">
                  5xx 错误
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" class="h-8" @click="refresh">
              <LucideSearch class="size-3.5" />
              搜索
            </Button>
            <Button variant="ghost" size="sm" class="h-8" @click="resetSearch">
              <LucideRefreshCw class="size-3.5" />
              重置
            </Button>
            <Button variant="outline" size="sm" class="h-8" :disabled="exportLoading" @click="handleExport">
              <LucideDownload class="size-3.5" />
              导出 CSV
            </Button>
          </div>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
          <div class="space-y-3 w-full">
            <Skeleton v-for="i in 8" :key="i" class="h-8 w-full" />
          </div>
        </div>
        <Alert v-else-if="error" variant="destructive" class="my-4">
          <AlertTitle>加载失败</AlertTitle>
          <AlertDescription class="flex items-center gap-2">
            无法加载API访问日志，请检查网络连接后重试。
            <Button variant="outline" size="sm" @click="refresh">
              重试
            </Button>
          </AlertDescription>
        </Alert>
        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>方法</TableHead>
                <TableHead>接口路径</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>响应时间</TableHead>
                <TableHead>IP 地址</TableHead>
                <TableHead>API Key</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="log in res?.data || []" :key="log.id">
                <TableCell class="text-xs whitespace-nowrap text-muted-foreground">
                  {{ log.createdAt ? format(new Date(log.createdAt), 'MM-dd HH:mm:ss') : '-' }}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" class="font-mono text-xs">
                    {{ log.method }}
                  </Badge>
                </TableCell>
                <TableCell class="max-w-60 truncate font-mono text-xs">
                  {{ log.endpoint }}
                </TableCell>
                <TableCell>
                  <Badge :variant="statusBadgeVariant(log.statusCode)" class="font-mono text-xs">
                    {{ log.statusCode }}
                  </Badge>
                </TableCell>
                <TableCell class="text-xs text-muted-foreground">
                  {{ log.responseTimeMs }}ms
                </TableCell>
                <TableCell class="text-xs text-muted-foreground font-mono">
                  {{ log.ipAddress }}
                </TableCell>
                <TableCell class="text-xs text-muted-foreground max-w-28 truncate">
                  {{ log.apiKeyName || '-' }}
                </TableCell>
              </TableRow>
              <TableRow v-if="!res?.data?.length">
                <TableCell colspan="7" class="py-8">
                  <Empty>
                    <SearchX class="size-10 text-muted-foreground" />
                    <p class="text-sm text-muted-foreground">
                      暂无API访问日志
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
