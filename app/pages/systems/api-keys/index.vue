<script setup lang="ts">
// 导入图标
import {
  LucidePlus,
} from 'lucide-vue-next'

import { toast } from 'vue-sonner'
import AddDialog from './modules/AddDialog.vue'
import ApiKeyDetailDialog from './modules/ApiKeyDetailDialog.vue'
import DeleteDialog from './modules/DeleteDialog.vue'
import ListSearch from './modules/ListSearch.vue'
import ListTable from './modules/ListTable.vue'
import SuccessDialog from './modules/SuccessDialog.vue'

const currentRow = ref<Api.ApiKeys.List>()
const newApiKey = ref<Api.ApiKeys.List | null>(null)

// 对话框状态
const showAddDialog = ref(false)
const addRef = shallowRef()
const deleteRef = shallowRef()
const showDeleteDialog = ref(false)
const successRef = shallowRef()
const successDialog = ref(false)
const viewRef = shallowRef()
const viewDialog = ref(false)

const { canPerformAction } = usePermissions()
const { pagination } = usePagination()
const searchParams = reactive(getInitSearchParams())

function getInitSearchParams(): Api.ApiKeys.ListSearchParams {
  return {
    ...pagination,
    name: '',
    status: undefined,
  }
}

const queryParams = computed(() => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
  name: searchParams.name,
  status: searchParams.status,
}))

const { data: res, pending: loading, refresh } = await useAsyncData(
  'api-keys',
  () => $fetch<Api.Common.PaginatingQueryRecord<Api.ApiKeys.List>>('/api/systems/api-keys', {
    query: queryParams.value,
  }),
)

async function showView(apiKey: Api.ApiKeys.List) {
  try {
    const response: any = await $fetch(`/api/systems/api-keys/${apiKey.id}`)
    if (response.success) {
      currentRow.value = response.data
      viewDialog.value = true
      await nextTick()
      viewRef.value?.openDialog()
      viewRef.value?.setFormData(currentRow.value)
    }
  }
  catch (error) {
    console.error('获取API密钥详情失败:', error)
    toast.error('获取API密钥详情失败')
  }
}
async function showAdd() {
  showAddDialog.value = true
  await nextTick()
  addRef.value?.openDialog('add')
}
async function showEdit(role: Api.ApiKeys.List) {
  currentRow.value = role
  showAddDialog.value = true
  await nextTick()
  addRef.value?.openDialog('edit')
  addRef.value?.setFormData(currentRow.value)
}

async function addSuccess(row: Api.ApiKeys.List) {
  if (row.apiKey) {
    newApiKey.value = row
    successDialog.value = true
    await nextTick()
    successRef.value?.openDialog()
    successRef.value?.setFormData(row)
  }
  refresh()
}

async function showDelete(row: Api.ApiKeys.List) {
  currentRow.value = row
  showDeleteDialog.value = true
  await nextTick()
  deleteRef.value?.openDialog()
  deleteRef.value?.setFormData(currentRow.value)
}
function handlePageUpdate(page: number) {
  pagination.page = page
  refresh()
}
function confirmDelete() {
  showDeleteDialog.value = false
  refresh()
  currentRow.value = undefined
}

function resetSearchParams() {
  Object.assign(searchParams, getInitSearchParams())
}

// 生命周期
onMounted(() => {
  refresh()
})

// SEO
useSeoMeta({
  title: 'API密钥管理 - 系统管理',
  description: '管理开放API的访问密钥和权限控制',
})
</script>

<template>
  <div class="container space-y-4">
    <ListSearch
      v-model:model="searchParams"
      @search="refresh"
      @reset="resetSearchParams"
    />
    <!-- 筛选和搜索 -->
    <Card class="mb-6">
      <ClientOnly>
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <h2>API密钥管理</h2>
            <Button v-if="canPerformAction('api_key', 'create')" class="h-7" @click="showAdd">
              <LucidePlus />
              创建API
            </Button>
          </CardTitle>
        </CardHeader>
      </ClientOnly>
      <CardContent class="mt-4">
        <ListTable
          :lists="res?.data || []"
          :loading="loading"
          @add="showAdd"
          @edit="showEdit"
          @view="showView"
          @delete="showDelete"
        />
      </CardContent>
      <Pagination
        v-slot="{ page }"
        class="justify-end"
        :items-per-page="pagination.pageSize"
        :total="res?.pagination.total"
        :sibling-count="1"
        :default-page="pagination.page"
        @update:page="handlePageUpdate"
      >
        <PaginationContent v-slot="{ items }">
          <PaginationPrevious>
            <ArrowLeft />
          </PaginationPrevious>
          <template v-for="(item, index) in items" :key="index">
            <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">
              {{ item.value }}
            </PaginationItem>
            <PaginationEllipsis v-else-if="item.type === 'ellipsis'" :index="index" />
          </template>

          <PaginationNext>
            <ArrowRight />
          </PaginationNext>
        </PaginationContent>
      </Pagination>
    </Card>

    <!-- 对话框组件 -->
    <AddDialog
      v-if="showAddDialog"
      ref="addRef"
      @success="addSuccess"
    />
    <ApiKeyDetailDialog
      v-if="viewDialog"
      ref="viewRef"
    />
    <SuccessDialog v-if="successDialog" ref="successRef" />
    <DeleteDialog
      v-if="showDeleteDialog"
      ref="deleteRef"
      @success="confirmDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<style scoped>

</style>
