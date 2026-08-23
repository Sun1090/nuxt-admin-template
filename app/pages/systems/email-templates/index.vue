<script setup lang="ts">
import { format } from 'date-fns'
import { LucidePlus, MailQuestion } from 'lucide-vue-next'
import AddDialog from './modules/AddDialog.vue'
import DeleteDialog from './modules/DeleteDialog.vue'

const { t } = useI18n()

const { canPerformAction } = usePermissions()
const addRef = shallowRef()
const deleteRef = shallowRef()
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const currentRow = ref<any>(null)

const { data: res, pending: loading, error, refresh } = await useAsyncData(
  'email-templates',
  () => $fetch('/api/systems/email-templates').catch((e) => {
    console.error('加载邮件模板失败:', e)
    throw e
  }),
)

function showAdd() {
  currentRow.value = null
  showAddDialog.value = true
  nextTick(() => addRef.value?.openDialog('add'))
}

function showEdit(row: any) {
  currentRow.value = row
  showAddDialog.value = true
  nextTick(() => {
    addRef.value?.openDialog('edit')
    addRef.value?.setFormData(row)
  })
}

function showDelete(row: any) {
  currentRow.value = row
  showDeleteDialog.value = true
  nextTick(() => deleteRef.value?.openDialog(row))
}

function addSuccess() {
  showAddDialog.value = false
  currentRow.value = null
  refresh()
}

function confirmDelete() {
  showDeleteDialog.value = false
  currentRow.value = null
  refresh()
}

useSeoMeta({
  title: () => `${t('emailTemplate.title')} - ${t('nav.system')}`,
  description: () => t('emailTemplate.description'),
})
</script>

<template>
  <div class="container space-y-4">
    <Card class="gap-0">
      <ClientOnly>
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <h2>{{ t('emailTemplate.title') }}</h2>
            <Button v-if="canPerformAction('template', 'create')" class="h-7" @click="showAdd">
              <LucidePlus />
              {{ t('common.add') }}
            </Button>
          </CardTitle>
          <CardDescription>
            管理系统中使用的邮件模板，支持自定义邮件标题和内容
          </CardDescription>
        </CardHeader>
      </ClientOnly>
      <CardContent class="pt-4">
        <div v-if="loading" class="flex justify-center py-12">
          <div class="space-y-3 w-full">
            <Skeleton v-for="i in 5" :key="i" class="h-8 w-full" />
          </div>
        </div>
        <Alert v-else-if="error" variant="destructive" class="my-4">
          <AlertTitle>{{ t('emailTemplate.loadFailed') }}</AlertTitle>
          <AlertDescription class="flex items-center gap-2">
            无法加载邮件模板，请检查网络连接后重试。
            <Button variant="outline" size="sm" @click="refresh">
              重试
            </Button>
          </AlertDescription>
        </Alert>
        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ t('emailTemplate.templateKey') }}</TableHead>
                <TableHead>{{ t('emailTemplate.templateName') }}</TableHead>
                <TableHead>{{ t('emailTemplate.subject') }}</TableHead>
                <TableHead>{{ t('emailTemplate.updatedAt') }}</TableHead>
                <TableHead class="w-20 text-right">
                  {{ t('common.actions') }}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in res?.data || []" :key="item.id">
                <TableCell class="font-mono text-xs">
                  {{ item.key }}
                </TableCell>
                <TableCell class="font-medium">
                  {{ item.name }}
                </TableCell>
                <TableCell class="max-w-xs truncate text-muted-foreground">
                  {{ item.subject }}
                </TableCell>
                <TableCell class="text-muted-foreground text-sm">
                  {{ item.updatedAt ? format(new Date(item.updatedAt), 'yyyy-MM-dd HH:mm') : '-' }}
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" class="size-8" @click="showEdit(item)">
                      <Icon name="i-lucide-edit" class="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" class="size-8 text-destructive" @click="showDelete(item)">
                      <Icon name="i-lucide-trash-2" class="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-if="!res?.data?.length">
                <TableCell colspan="5" class="py-8">
                  <Empty>
                    <MailQuestion class="size-10 text-muted-foreground" />
                    <p class="text-sm text-muted-foreground">
                      {{ t('emailTemplate.noTemplates') }}
                    </p>
                    <Button v-if="canPerformAction('template', 'create')" variant="outline" size="sm" @click="showAdd">
                      {{ t('common.add') }}模板
                    </Button>
                  </Empty>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <AddDialog
      v-if="showAddDialog"
      ref="addRef"
      :row="currentRow"
      @success="addSuccess"
      @cancel="showAddDialog = false"
    />

    <DeleteDialog
      v-if="showDeleteDialog"
      ref="deleteRef"
      @success="confirmDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>
