<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { LucideAlertCircle, LucideLoader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { actionRecord, categoryRecord, resourceRecord } from '~/constants/constant'
import { generatePermissionName, parsePermissionName } from '~/utils/common'

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
  category: z.string().min(1, '分类不能为空'),
  resource: z.string().min(1, '资源不能为空'),
  action: z.string().optional(),
  name: z.string().optional(),
  remark: z.string().optional(),
}).refine((data) => {
  // 当 category 为 action 时，action 必填
  if (data.category === 'action') {
    return !!data.action?.trim()
  }
  return true
}, {
  message: '操作类型不能为空',
  path: ['action'],
}))

const { handleSubmit, setValues, validate, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    category: undefined,
    resource: '',
    action: '',
    name: '',
    remark: '',
  },
})

const loading = ref(false)
const error = ref('')

const formSubmit = handleSubmit(async (form) => {
  values.name = generatePermissionName(form.category, form.resource, form.action)
  await validate()
  loading.value = true
  error.value = ''
  try {
    let result: Api.Role.List
    if (mode.value === 'edit') {
      result = await $fetch<Api.Role.List>(`/api/systems/permissions/${values.id}`, {
        method: 'PUT',
        body: form,
      })
    }
    else {
      result = await $fetch<Api.Role.List>('/api/systems/permissions', {
        method: 'POST',
        body: form,
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
  const { category, resource, action } = parsePermissionName(row.name)
  console.log(category, resource, action)
  setValues({
    ...row,
    category,
    resource,
    action,
  })
  console.log(row)
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
            <FormLabel class="text-sm">
              名称
            </FormLabel>
            <FormControl>
              <Input
                disabled
                class="h-9"
                type="text"
                placeholder="名称"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="category">
          <FormItem>
            <FormLabel class="text-sm required">
              分类
            </FormLabel>
            <FormControl>
              <Select class="h-1" v-bind="componentField">
                <SelectTrigger class="w-full px-2 text-sm!">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    全部
                  </SelectItem>
                  <SelectItem v-for="(item, index) in transformRecordToOption(categoryRecord)" :key="index" :value="item.value">
                    {{ item.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="resource">
          <FormItem>
            <FormLabel class="text-sm required">
              资源
            </FormLabel>
            <FormControl>
              <Select class="h-1" v-bind="componentField">
                <SelectTrigger class="w-full px-2 text-sm!">
                  <SelectValue placeholder="资源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    全部
                  </SelectItem>
                  <SelectItem v-for="(item, index) in transformRecordToOption(resourceRecord)" :key="index" :value="item.value">
                    {{ item.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-if="values.category === 'action'" v-slot="{ componentField }" name="action">
          <FormItem>
            <FormLabel class="text-sm required">
              权限
            </FormLabel>
            <FormControl>
              <Select class="h-1" v-bind="componentField">
                <SelectTrigger class="w-full px-2 text-sm!">
                  <SelectValue placeholder="权限" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    全部
                  </SelectItem>
                  <SelectItem v-for="(item, index) in transformRecordToOption(actionRecord)" :key="index" :value="item.value">
                    {{ item.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
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
