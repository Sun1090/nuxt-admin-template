<script setup lang="ts">
import { LucideAlertTriangle, LucideLoader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const emit = defineEmits<Emit>()
interface Emit {
  (e: 'success'): void
  (e: 'close'): void
}

const open = ref(false)
const current = ref()
const loading = ref(false)

async function handleConfirm() {
  loading.value = true
  try {
    const response: any = await $fetch(`/api/systems/api-keys/${current.value.id}`, {
      method: 'DELETE',
    })

    if (response.success) {
      toast.success('API密钥删除成功')
      emit('success')
    }
  }
  catch (error: any) {
    console.error('删除API密钥失败:', error)
    toast.error(error.data?.message || '删除API密钥失败')
  }
  finally {
    loading.value = false
  }
}
function setFormData(row: Record<any, any>) {
  current.value = row
}
function openDialog() {
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
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          系统提示
        </DialogTitle>
        <DialogDescription />
      </DialogHeader>

      <Alert variant="destructive">
        <LucideAlertTriangle class="w-4 h-4" />
        <AlertTitle>警告</AlertTitle>
        <AlertDescription>确定要删除API密钥 "{{ row?.name }}" 吗？此操作不可撤销。</AlertDescription>
      </Alert>

      <DialogFooter class="gap-2">
        <Button variant="outline" :disabled="loading" @click="handleClose">
          取消
        </Button>
        <Button variant="destructive" :disabled="loading" @click="handleConfirm">
          <LucideLoader2 v-if="loading" class="animate-spin" />
          确认删除
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
