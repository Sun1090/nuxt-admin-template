<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { LucideLoader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

const props = defineProps<{ row: any }>()

const emit = defineEmits<{ success: [], cancel: [] }>()

const { t } = useI18n()

const visible = ref(false)
const mode = ref<'add' | 'edit'>('add')
const saving = ref(false)

const formSchema = toTypedSchema(z.object({
  key: z.string().min(1, '标识不能为空'),
  name: z.string().min(1, '名称不能为空'),
  subject: z.string().min(1, '主题不能为空'),
  html: z.string().min(1, '内容不能为空'),
}))

const { handleSubmit, setValues, resetForm } = useForm({ validationSchema: formSchema })

function openDialog(m?: 'add' | 'edit') {
  mode.value = m || 'add'
  visible.value = true
  if (m === 'edit' && props.row) {
    setValues({
      key: props.row.key,
      name: props.row.name,
      subject: props.row.subject,
      html: props.row.html,
    })
  }
}

function setFormData(data: any) {
  setValues({
    key: data.key,
    name: data.name,
    subject: data.subject,
    html: data.html,
  })
}

const onSubmit = handleSubmit(async (form) => {
  saving.value = true
  try {
    if (mode.value === 'edit') {
      await $fetch(`/api/systems/email-templates/${props.row.id}`, {
        method: 'PUT',
        body: form,
      })
      toast.success('更新成功')
    }
    else {
      await $fetch('/api/systems/email-templates', {
        method: 'POST',
        body: form,
      })
      toast.success('创建成功')
    }
    visible.value = false
    resetForm()
    emit('success')
  }
  catch (error: any) {
    toast.error(error.data?.message || error.message || '操作失败')
  }
  finally {
    saving.value = false
  }
})

defineExpose({ openDialog, setFormData })
</script>

<template>
  <Dialog :open="visible" @update:open="visible = $event; if (!$event) emit('cancel')">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ mode === 'edit' ? '编辑' : '新增' }}邮件模板</DialogTitle>
        <DialogDescription>配置邮件模板的标识、名称、主题和HTML内容</DialogDescription>
      </DialogHeader>
      <form @submit="onSubmit">
        <div class="grid gap-4 py-4">
          <FormField v-slot="{ componentField }" name="key">
            <FormItem>
              <FormLabel>标识</FormLabel>
              <FormControl>
                <Input v-bind="componentField" placeholder="如: welcome_email" :disabled="mode === 'edit'" />
              </FormControl>
              <FormDescription>模板的唯一标识，用于代码中引用</FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>名称</FormLabel>
              <FormControl>
                <Input v-bind="componentField" placeholder="如: 欢迎邮件" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="subject">
            <FormItem>
              <FormLabel>邮件主题</FormLabel>
              <FormControl>
                <Input v-bind="componentField" placeholder="如: 欢迎加入 {{siteName}}" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="html">
            <FormItem>
              <FormLabel>HTML 内容</FormLabel>
              <FormControl>
                <Textarea v-bind="componentField" rows="8" class="font-mono text-sm" placeholder="<html>..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="visible = false; emit('cancel')">
            取消
          </Button>
          <Button type="submit" :disabled="saving">
            <LucideLoader2 v-if="saving" class="mr-2 size-4 animate-spin" />
            {{ mode === 'edit' ? '保存' : '创建' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
