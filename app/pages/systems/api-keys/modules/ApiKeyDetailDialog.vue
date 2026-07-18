<script setup lang="ts">
import { FileText, Loader2, RefreshCw } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Emits {
  (e: 'success', apiKey: Api.ApiKeys.List): void
  (e: 'close'): void
}
const emit = defineEmits<Emits>()

const open = ref(false)
// 日志相关
const apiLogs = ref([])
const loadingLogs = ref(false)
const logsPagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})
const apiKey = reactive<Api.ApiKeys.List>(
  {
    id: '',
    name: '',
    remark: '',
    apiKey: '',
    keyPrefix: '',
    isActive: false,
    isExpired: false,
    status: 'active',
    creatorName: '',
    createdAt: '',
    expiresAt: '',
    lastUsedAt: '',
    usageCount: 0,
    permissions: [],
  },
)
function getStatusText(status) {
  const statusMap = {
    active: '活跃',
    inactive: '非活跃',
    expired: '已过期',
  }
  return statusMap[status] || status
}

function getStatusVariant(status) {
  if (typeof status === 'string') {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      expired: 'destructive',
    }
    return variants[status] || 'default'
  }
  else {
    // HTTP 状态码
    if (status === 2)
      return 'default'
    if (status === 4)
      return 'warning'
    if (status === 5)
      return 'destructive'
    return 'secondary'
  }
}

function getMethodVariant(method) {
  const variants = {
    GET: 'default',
    POST: 'secondary',
    PUT: 'outline',
    DELETE: 'destructive',
    PATCH: 'outline',
  }
  return variants[method] || 'secondary'
}

function formatDate(dateString) {
  if (!dateString)
    return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

async function loadApiLogs(page = 1) {
  loadingLogs.value = true
  try {
    const response = await $fetch('/api/systems/api-keys/logs', {
      query: {
        apiKeyId: apiKey.id,
        page,
        limit: logsPagination.value.limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    })

    if (response.logs) {
      apiLogs.value = response.logs
      logsPagination.value = {
        ...logsPagination.value,
        ...response.pagination,
        page,
      }
    }
  }
  catch (error) {
    console.error('获取API使用日志失败:', error)
    apiLogs.value = []
  }
  finally {
    loadingLogs.value = false
  }
}

async function setFormData(row: Api.ApiKeys.List) {
  Object.assign(apiKey, row)
  if (row.apiKey) {
    loadApiLogs(1)
  }
  else {
    // 重置日志状态
    apiLogs.value = []
    logsPagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    }
  }
}

async function openDialog() {
  open.value = true
}

function handleClose() {
  open.value = false
  emit('close')
}

defineExpose({
  openDialog,
  handleClose,
  setFormData,
})
</script>

<template>
  <Dialog v-model:open="open" class="max-w-4xl">
    <DialogContent class="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle> API密钥详情</DialogTitle>
        <Dialogremark />
      </DialogHeader>
      <div v-if="apiKey" class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- 基本信息 -->
        <div class="space-y-4">
          <h4 class="text-lg font-semibold">
            基本信息
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">名称</Label>
              <p class="mt-1">
                {{ apiKey.name }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">状态</Label>
              <div class="mt-1">
                <Badge :variant="getStatusVariant(apiKey.status)">
                  {{ getStatusText(apiKey.status) }}
                </Badge>
              </div>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">创建者</Label>
              <p class="mt-1">
                {{ apiKey.creatorName || '--' }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">创建时间</Label>
              <p class="mt-1">
                {{ formatDate(apiKey.createdAt) }}
              </p>
            </div>
            <div v-if="apiKey.expiresAt" class="col-span-2">
              <Label class="text-sm font-medium text-muted-foreground">过期时间</Label>
              <p class="mt-1" :class="{ 'text-destructive': apiKey.isExpired }">
                {{ formatDate(apiKey.expiresAt) }}
              </p>
            </div>
            <div class="col-span-2">
              <Label class="text-sm font-medium text-muted-foreground">描述</Label>
              <p class="mt-1">
                {{ apiKey.remark || '暂无描述' }}
              </p>
            </div>
          </div>
        </div>

        <!-- 使用统计 -->
        <div class="space-y-4">
          <h4 class="text-lg font-semibold">
            使用统计
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-muted/50 rounded-lg p-4">
              <Label class="text-sm font-medium text-muted-foreground">总调用次数</Label>
              <p class="text-2xl font-bold mt-2">
                {{ apiKey.usageCount || 0 }}
              </p>
            </div>
            <div class="bg-muted/50 rounded-lg p-4">
              <Label class="text-sm font-medium text-muted-foreground">最后使用时间</Label>
              <p class="text-lg font-semibold mt-2">
                {{ apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : '从未使用' }}
              </p>
            </div>
          </div>
        </div>

        <!-- 使用日志 -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-semibold">
              使用日志
            </h4>
            <Button variant="outline" size="sm" :disabled="loadingLogs" @click="loadApiLogs(1)">
              <RefreshCw v-if="loadingLogs" class="h-4 w-4 mr-2 animate-spin" />
              刷新
            </Button>
          </div>

          <div class="border rounded-lg">
            <div v-if="loadingLogs" class="p-8 text-center">
              <Loader2 class="h-6 w-6 animate-spin mx-auto mb-2" />
              <p class="text-sm text-muted-foreground">
                加载日志中...
              </p>
            </div>

            <div v-else-if="apiLogs.length === 0" class="p-8 text-center">
              <FileText class="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p class="text-sm text-muted-foreground">
                暂无使用记录
              </p>
            </div>

            <div v-else class="divide-y">
              <div v-for="log in apiLogs" :key="log.id" class="p-4 hover:bg-muted/50 transition-colors">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <Badge :variant="getMethodVariant(log.method)" class="font-mono text-xs">
                      {{ log.method }}
                    </Badge>
                    <code class="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {{ log.endpoint }}
                    </code>
                  </div>
                  <Badge :variant="getStatusVariant(Math.floor(log.statusCode / 100))">
                    {{ log.statusCode }}
                  </Badge>
                </div>
                <div class="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{{ formatDate(log.createdAt) }}</span>
                  <span>{{ log.ipAddress }}</span>
                  <span>{{ log.responseTimeMs }}ms</span>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div
              v-if="apiLogs.length > 0 && logsPagination.totalPages > 1"
              class="flex items-center justify-between p-4 border-t"
            >
              <p class="text-sm text-muted-foreground">
                第 {{ logsPagination.page }} 页，共 {{ logsPagination.totalPages }} 页
              </p>
              <div class="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="logsPagination.page <= 1"
                  @click="loadApiLogs(logsPagination.page - 1)"
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="logsPagination.page >= logsPagination.totalPages"
                  @click="loadApiLogs(logsPagination.page + 1)"
                >
                  下一页
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- 权限列表 -->
        <div class="space-y-4">
          <h4 class="text-lg font-semibold">
            权限列表
          </h4>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="permission in apiKey.permissions" :key="permission" variant="secondary">
              {{ permission }}
            </Badge>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <Loader2 class="h-8 w-8 animate-spin mx-auto mb-4" />
        <p class="text-muted-foreground">
          加载中...
        </p>
      </div>
    </DialogContent>
  </Dialog>
</template>
