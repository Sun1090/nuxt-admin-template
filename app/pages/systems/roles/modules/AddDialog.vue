<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { LucideAlertCircle, LucideLoader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

interface Emit {
  (e: 'success', role: Api.Role.List): void
  (e: 'close'): void
}

const emit = defineEmits<Emit>()
const mode = ref('add')
const popupTitle = computed(() => {
  return mode.value === 'edit' ? '编辑' : '新增'
})
const open = ref(false)

const formSchema = toTypedSchema(z.object({
  id: z.string().optional(),
  name: z.string().min(1, '名称不能为空').min(2, '名称至少2个字符'),
  remark: z.string().optional(),
}))

const { handleSubmit, setValues, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    remark: '',
  },
})

const loading = ref(false)
const error = ref('')

const formSubmit = handleSubmit(async (form) => {
  loading.value = true
  error.value = ''
  try {
    let result: Api.Role.List
    if (mode.value === 'edit') {
      result = await $fetch<Api.Role.List>(`/api/systems/roles/${values.id}`, {
        method: 'PUT',
        body: {
          name: form.name,
          remark: form.remark,
        },
      })
    }
    else {
      result = await $fetch<Api.Role.List>('/api/systems/roles', {
        method: 'POST',
        body: {
          name: form.name,
          remark: form.remark,
        },
      })
    }

    toast.success(mode.value === 'edit' ? '更新成功' : '创建成功')
    emit('success', result)
    open.value = false
  }
  catch (err: any) {
    console.error('操作失败:', err)
    error.value = err.data?.message || (mode.value === 'edit' ? '更新失败' : '创建失败')
  }
  finally {
    loading.value = false
  }
})

function setFormData(row: Record<any, any>) {
  setValues({
    // 使用 props 结构确保安全访问
    id: row.id ?? '',
    name: row.name ?? '',
    remark: row.remark ?? '',
  })
}

async function openDialog(type = 'add') {
  mode.value = type
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
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          {{ popupTitle }}
        </DialogTitle>
        <DialogDescription>
          <!-- 错误信息放在表单顶部 -->
          <Alert v-if="error" variant="destructive">
            <LucideAlertCircle class="w-4 h-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="formSubmit">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel class="text-sm required">
              名称
            </FormLabel>
            <FormControl>
              <Input
                class="h-9"
                type="text"
                placeholder="名称"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="remark">
          <FormItem>
            <FormLabel class="text-sm">
              备注
            </FormLabel>
            <FormControl>
              <Input
                type="text"
                class="h-9"
                placeholder="请输入备注"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <DialogFooter>
          <Button type="button" variant="outline" :disabled="loading" @click="handleClose">
            取消
          </Button>
          <Button type="submit" :disabled="loading" class="min-w-20">
            <LucideLoader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            {{ mode === 'edit' ? '更新' : '创建' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.required::after {
  content: ' *';
  color: #ef4444;
}
</style>
