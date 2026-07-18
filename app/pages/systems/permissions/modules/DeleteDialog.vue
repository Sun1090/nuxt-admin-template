<script setup lang="ts">
import { LucideAlertTriangle, LucideLoader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const emit = defineEmits<Emit>()
interface Emit {
  (e: 'success'): void
  (e: 'close'): void
}

const open = ref(false)
const id = ref()
const loading = ref(false)

async function handleConfirm() {
  loading.value = true
  try {
    await $fetch(`/api/systems/permissions/${id.value}`, {
      method: 'DELETE',
    })
    toast.success('删除成功')
    open.value = false
    emit('success')
  }
  catch (error: any) {
    toast.error(error.data?.message || '删除失败')
  }
  finally {
    loading.value = false
  }
}
function setFormData(row: Record<any, any>) {
  id.value = row.id
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
        <AlertDescription> 此操作不可撤销，请谨慎操作。 </AlertDescription>
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
