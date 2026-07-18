<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { AlertCircle, Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { apiPermissions } from '~/constants/constant'

interface Emits {
  (e: 'success', apiKey: Api.ApiKeys.List): void
  (e: 'close'): void
}
const emit = defineEmits<Emits>()

const mode = ref('add')
const popupTitle = computed(() => {
  return mode.value === 'edit' ? '编辑' : '新增'
})
const open = ref(false)

const formSchema = toTypedSchema(z.object({
  id: z.string().optional(),
  name: z.string().min(1, '请输入API密钥名称'),
  remark: z.string().min(1, '不能为空'),
  expiresAt: z.string().min(1, '不能为空'),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).min(1, '至少需要选择一个').optional(),
}))

const { handleSubmit, setValues, validate, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    remark: '',
    expiresAt: '',
    permissions: [],
    isActive: false,
  },
})
const loading = ref(false)
const error = ref('')

const submitForm = handleSubmit(async (form) => {
  await validate()
  loading.value = true
  error.value = ''

  try {
    const data = {
      name: form.name,
      remark: form.remark || null,
      expiresAt: form.expiresAt || null,
      permissions: form.permissions,
      isActive: form.isActive,
    }

    let response: any

    if (mode.value === 'edit') {
      response = await $fetch(`/api/systems/api-keys/${values.id}`, {
        method: 'PUT',
        body: data,
      })
    }
    else {
      response = await $fetch('/api/systems/api-keys', {
        method: 'POST',
        body: data,
      })
    }

    if (response.success) {
      toast.success(mode.value === 'edit' ? 'API密钥更新成功' : 'API密钥创建成功')
      emit('success', response.data)
      handleClose()
    }
  }
  catch (err: any) {
    console.error('操作失败:', err)
    error.value = err.data?.message || (mode.value === 'edit' ? '更新API密钥失败' : '创建API密钥失败')
    toast.error(error.value)
  }
  finally {
    loading.value = false
  }
})

async function setFormData(row: Api.ApiKeys.List) {
  try {
    const data: any = await $fetch<Api.ApiKeys.List>(`/api/systems/api-keys/${row.id}`)
    if (data.success) {
      setValues({
        ...data.data,
        expiresAt: data.data.expiresAt
          ? new Date(data.data.expiresAt).toISOString().slice(0, 16)
          : '',
      })
    }
  }
  catch (error) {
    console.error('获取API密钥详情失败:', error)
    toast.error('获取API密钥详情失败')
  }
}

async function openDialog(type: 'add') {
  open.value = true
  mode.value = type
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
  <Dialog v-model:open="open" class="max-w-4xl">
    <DialogContent>
      <DialogHeader>
        <DialogTitle> {{ popupTitle }}</DialogTitle>
        <Dialogremark>
          <Alert v-if="error" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <Alertremark>{{ error }}</Alertremark>
          </Alert>
        </Dialogremark>
      </DialogHeader>
      <form @submit="submitForm">
        <div class="max-h-[80vh] space-y-4 overflow-y-auto">
          <!-- 基本信息 -->
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel class="text-sm required">
                名称
              </FormLabel>
              <FormControl>
                <Input
                  class="h-9"
                  type="text"
                  placeholder="输入API密钥名称"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="remark">
            <FormItem>
              <FormLabel class="text-sm ">
                描述
              </FormLabel>
              <FormControl>
                <Input
                  class="h-9"
                  type="text"
                  placeholder="输入API密钥描述"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="expiresAt">
            <FormItem>
              <FormLabel>
                有效期
              </FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger>
                    <SelectValue placeholder="选择有效期" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      永不过期
                    </SelectItem>
                    <SelectItem value="3d">
                      3天后过期
                    </SelectItem>
                    <SelectItem value="7d">
                      7天后过期
                    </SelectItem>
                    <SelectItem value="30d">
                      30天后过期
                    </SelectItem>
                    <SelectItem value="60d">
                      60天后过期
                    </SelectItem>
                    <SelectItem value="90d">
                      90天后过期
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p class="text-sm text-muted-foreground">
                  选择API密钥的有效期
                </p>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- 权限设置 -->
          <div class="space-y-3">
            <Label class="font-normal required">
              权限设置
            </Label>
            <FormField
              v-for="permission in apiPermissions"
              :key="permission.value"
              v-slot="{ value, handleChange }"
              class="flex items-center gap-3 p-3 border rounded-lg transition-colors"
              name="permissions"
              type="checkbox"
              :value="permission.value"
              :unchecked-value="false"
            >
              <FormItem
                class="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-lg hover:bg-accent/50"
              >
                <FormControl>
                  <Checkbox
                    :model-value="value?.includes(permission.value)"
                    class="mt-1"
                    @update:model-value="handleChange"
                  />
                </FormControl>
                <FormLabel class="font-normal">
                  <div class="flex-1 min-w-0">
                    <Label :for="permission.value" class="font-medium cursor-pointer">
                      {{ permission.label }}
                    </Label>
                    <p class="text-sm text-muted-foreground mt-1">
                      {{ permission.remark }}
                    </p>
                  </div>
                </FormLabel>
              </FormItem>
            </FormField>

            <p v-if="values.permissions?.length === 0" class="text-sm text-destructive">
              请至少选择一个权限
            </p>
          </div>
          <FormField
            v-slot="{ value, handleChange }"
            type="checkbox" :value="true" :unchecked-value="false" name="isActive"
          >
            <FormItem>
              <FormLabel class="text-sm ">
                状态设置
              </FormLabel>
              <FormControl>
                <div class="flex flex-row gap-4">
                  <Checkbox
                    :model-value="value"
                    @update:model-value="handleChange"
                  />
                  <Label class="cursor-pointer"> 启用此API密钥 </Label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
        <DialogFooter class="flex justify-between items-center">
          <div class="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" :disabled="loading" @click="handleClose">
              取消
            </Button>
            <Button type="submit" :disabled="loading">
              <Loader2 v-if="loading" class="h-4 w-4 mr-2 animate-spin" />
              确定
            </Button>
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
    <!-- 操作按钮 -->
  </Dialog>
</template>
