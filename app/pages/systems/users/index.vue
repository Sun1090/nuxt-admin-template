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
const roles = ref<Api.Role.List[]>([])
const searchParams = reactive(getInitSearchParams())
function getInitSearchParams(): Api.User.ListSearchParams {
  return {
    page: 1,
    pageSize: 10,
    username: '',
    status: '',
    role: '',
  }
}
const { pagination } = usePagination()
const queryParams = computed(() => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
  username: searchParams.username,
  status: searchParams.status === 'all' ? '' : searchParams.status,
  role: searchParams.role === 'all' ? '' : searchParams.role,
}))
const addRef = shallowRef()
const resetRef = shallowRef()
const deleteRef = shallowRef()
const showAddDialog = ref(false)
const showResetDialog = ref(false)
const showDeleteDialog = ref(false)
const editingUser = ref<Api.User.List | null>(null)

const { data: res, pending: loading, refresh } = await useAsyncData(
  'users',
  () => $fetch<Api.Common.PaginatingQueryRecord<Api.User.List>>('/api/systems/users/page', {
    query: queryParams.value,
  }),
)

async function getRoles() {
  try {
    const data = await $fetch<Api.Common.PaginatingQueryRecord<Api.Role.List>>('/api/systems/roles')
    roles.value = data.data
    console.log(roles.value)
  }
  catch (error) {
    console.error('加载角色失败:', error)
  }
}

function resetSearchParams() {
  Object.assign(searchParams, getInitSearchParams())
}
async function showAdd() {
  showAddDialog.value = true
  await nextTick()
  addRef.value?.openDialog('add')
}
async function showEdit(user: Api.User.List) {
  console.log(user)
  editingUser.value = user
  showAddDialog.value = true
  await nextTick()
  addRef.value?.openDialog('edit')
  addRef.value?.setFormData(editingUser.value)
}

async function showReset(user: Api.User.List) {
  showResetDialog.value = true
  editingUser.value = user
  await nextTick()
  resetRef.value?.openDialog()
  resetRef.value?.setFormData(editingUser.value)
}

async function toggleStatus(user: Api.User.List, newStatus: string) {
  try {
    await $fetch(`/api/systems/users/${user.id}/status`, {
      method: 'PUT',
      body: { status: newStatus },
    })

    toast.success(`用户 ${newStatus === 'active' ? '启用' : '停用'}成功`)
    await refresh()
  }
  catch (error: any) {
    toast.error(`操作失败: ${error.data?.message}`)
  }
}

async function showDelete(user: Api.User.List) {
  if (user.id === currentUser.value?.id) {
    toast.error('不能删除当前登录用户')
    return
  }
  editingUser.value = user
  showDeleteDialog.value = true
  await nextTick()
  deleteRef.value?.openDialog()
  deleteRef.value?.setFormData(editingUser.value)
}

function confirmDelete() {
  showDeleteDialog.value = false
  refresh()
  editingUser.value = null
}

function addSuccess() {
  showAddDialog.value = false
  editingUser.value = null
  refresh()
}
function handeUserReset() {
  showResetDialog.value = false
  editingUser.value = null
  refresh()
}
function handlePageUpdate(newPage: number) {
  pagination.page = newPage
  refresh()
}
getRoles()
refresh()
// SEO
useSeoMeta({
  title: '用户管理 - 系统管理',
  description: '管理系统用户账户和权限',
})
</script>

<template>
  <div class="container space-y-4">
    <ListSearch
      v-model:model="searchParams"
      :roles="roles"
      @search="refresh"
      @reset="resetSearchParams"
    />
    <Card class="gap-0">
      <ClientOnly>
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <h2>用户列表</h2>
            <Button v-if="canPerformAction('user', 'create')" class="h-7" @click="showAdd">
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
          @toggle="toggleStatus"
          @delete="showDelete"
        />
      </CardContent>
    </Card>

    <Pagination
      v-slot="{ page }"
      class="justify-end"
      :items-per-page="pagination.pageSize"
      :total="res?.pagination?.total"
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
      :roles="roles"
      @success="addSuccess"
      @cancel="showAddDialog = false"
    />

    <ResetDialog
      v-if="showResetDialog"
      ref="resetRef"
      @success="handeUserReset"
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
