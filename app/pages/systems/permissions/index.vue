<script setup lang="ts">
import { ArrowLeft, ArrowRight, LucidePlus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AddDialog from './modules/AddDialog.vue'
import DeleteDialog from './modules/DeleteDialog.vue'
import ListSearch from './modules/ListSearch.vue'
import ListTable from './modules/ListTable.vue'
import ResetDialog from './modules/ResetDialog.vue'

const { canPerformAction } = usePermissions()
const { user: currentUser } = useAuth()

const { pagination } = usePagination()
const searchParams = reactive(getInitSearchParams())

function getInitSearchParams(): Api.Permission.ListSearchParams {
  return {
    ...pagination,
    name: '',
  }
}

const queryParams = computed(() => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
  name: searchParams.name,
}))
const addRef = shallowRef()
const resetRef = shallowRef()
const deleteRef = shallowRef()
const showAddDialog = ref(false)
const showResetDialog = ref(false)
const showDeleteDialog = ref(false)
const currentRow = ref<Api.Permission.List | null>(null)

const { data: res, pending: loading, refresh } = await useAsyncData(
  'permissions',
  () => $fetch<Api.Common.PaginatingQueryRecord<Api.Permission.List>>('/api/systems/permissions/page', {
    query: queryParams.value,
  }),
)

function resetSearchParams() {
  Object.assign(searchParams, getInitSearchParams())
}

async function showReset(row: Api.Permission.List) {
  showResetDialog.value = true
  currentRow.value = row
  await nextTick()
  resetRef.value?.openDialog()
  resetRef.value?.setFormData(currentRow.value)
}
async function showAdd() {
  showAddDialog.value = true
  await nextTick()
  addRef.value?.openDialog('add')
}
async function showEdit(row: Api.Permission.List) {
  currentRow.value = row
  showAddDialog.value = true
  await nextTick()
  addRef.value?.openDialog('edit')
  addRef.value?.setFormData(currentRow.value)
}

async function showDelete(row: Api.Permission.List) {
  if (row?.id === currentUser.value?.roleId) {
    toast.error('不能删除当前登录用户')
    return
  }
  currentRow.value = row
  showDeleteDialog.value = true
  await nextTick()
  deleteRef.value?.openDialog()
  deleteRef.value?.setFormData(currentRow.value)
}

function confirmDelete() {
  showDeleteDialog.value = false
  refresh()
  currentRow.value = null
}

function addSuccess() {
  showAddDialog.value = false
  currentRow.value = null
  refresh()
}
function handeRoleReset() {
  showResetDialog.value = false
  currentRow.value = null
  refresh()
}
function handlePageUpdate(newPage: number) {
  pagination.page = newPage
  refresh()
}
refresh()

// SEO
useSeoMeta({
  title: '权限管理 - 劳务派遣系统',
  description: '管理系统权限和权限分配',
})
</script>

<template>
  <div class="container space-y-4">
    <ListSearch
      v-model:model="searchParams"
      @search="refresh"
      @reset="resetSearchParams"
    />
    <Card class="gap-0">
      <ClientOnly>
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <h2>权限列表</h2>
            <Button v-if="canPerformAction('permission', 'create')" class="h-7" @click="showAdd">
              <LucidePlus />
              新增
            </Button>
          </CardTitle>
        </CardHeader>
      </ClientOnly>
      <CardContent class="pt-4">
        <ListTable
          :lists="res?.data || []"
          :current-user-id="currentUser?.id"
          :loading="loading"
          @edit="showEdit"
          @reset="showReset"
          @delete="showDelete"
        />
      </CardContent>
    </Card>

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

    <AddDialog
      v-if="showAddDialog"
      ref="addRef"
      @success="addSuccess"
      @cancel="showAddDialog = false"
    />
    <ResetDialog
      v-if="showResetDialog"
      ref="resetRef"
      @success="handeRoleReset"
      @cancel="showResetDialog = false"
    />

    <DeleteDialog
      v-if="showDeleteDialog"
      ref="deleteRef"
      @success="confirmDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>
