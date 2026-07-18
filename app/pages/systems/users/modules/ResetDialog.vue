<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { LucideAlertTriangle, LucideLoader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

interface Emit {
  (e: 'success'): void
  (e: 'close'): void
}
const emit = defineEmits<Emit>()
const open = ref(false)
const userId = ref()
const formSchema = toTypedSchema(z.object({
  currentPassword: z.string(),
  password: z.string().min(6, '密码至少6个字符'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: '密码不匹配',
  path: ['confirmPassword'],
}))
const { handleSubmit, validate } = useForm({
  validationSchema: formSchema,
})
const loading = ref(false)

const onSubmit = handleSubmit(async (form) => {
  console.log(form)
  await validate()

  loading.value = true

  try {
    await $fetch(`/api/systems/users/${userId.value}/reset-password`, {
      method: 'POST',
      body: {
        currentPassword: form.currentPassword,
        newPassword: form.password,
      },
    })

    toast.success('密码重置成功')
    emit('success')
    open.value = false
  }
  catch (error: any) {
    toast.error(`重置密码失败: ${error.data?.message}`)
  }
  finally {
    loading.value = false
  }
})
function setFormData(row: Record<any, any>) {
  userId.value = row.id
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
    <DialogContent>
      <form @submit="onSubmit">
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div class="space-y-4">
          <Alert variant="destructive">
            <LucideAlertTriangle class="w-4 h-4" />
            <AlertTitle>注意</AlertTitle>
            <AlertDescription> 重置后用户需要使用新密码登录，首次登录后需要修改密码。 </AlertDescription>
          </Alert>

          <FormField v-slot="{ componentField }" name="currentPassword">
            <FormItem>
              <FormLabel class="text-sm">
                当前密码
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="当前密码" v-bind="componentField" autocomplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel class="text-sm">
                密码
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="密码" v-bind="componentField" autocomplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="confirmPassword">
            <FormItem>
              <FormLabel class="text-sm">
                确认密码
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="确认密码" v-bind="componentField" autocomplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" :disabled="loading" @click="handleClose">
              取消
            </Button>
            <Button type="submit" :disabled="loading">
              <LucideLoader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
              确定
            </Button>
          </DialogFooter>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
