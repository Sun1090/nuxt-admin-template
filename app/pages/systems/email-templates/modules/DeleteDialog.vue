<script setup lang="ts">
import { LucideAlertTriangle, LucideLoader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const emit = defineEmits<{ success: [], cancel: [] }>()

const { t } = useI18n()

const visible = ref(false)
const deleting = ref(false)
const rowId = ref<number | null>(null)

function openDialog(data?: any) {
  rowId.value = data?.id || null
  visible.value = true
}

async function onSubmit() {
  if (!rowId.value)
    return
  deleting.value = true
  try {
    await $fetch(`/api/systems/email-templates/${rowId.value}`, { method: 'DELETE' })
    toast.success('删除成功')
    visible.value = false
    emit('success')
  }
  catch (error: any) {
    toast.error(error.data?.message || '删除失败')
  }
  finally {
    deleting.value = false
  }
}

defineExpose({ openDialog })
</script>

<template>
  <AlertDialog :open="visible" @update:open="visible = $event; if (!$event) emit('cancel')">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle class="flex items-center gap-2">
          <LucideAlertTriangle class="size-5 text-destructive" />
          确认删除
        </AlertDialogTitle>
        <AlertDialogDescription>
          删除后无法恢复，是否确认删除该邮件模板？
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction as-child>
          <Button variant="destructive" :disabled="deleting" @click="onSubmit">
            <LucideLoader2 v-if="deleting" class="mr-2 size-4 animate-spin" />
            确认删除
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
