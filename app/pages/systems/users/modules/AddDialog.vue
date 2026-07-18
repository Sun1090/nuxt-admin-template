<script setup lang="ts">
import { lorelei } from '@dicebear/collection'
import { createAvatar } from '@dicebear/core'
import { toTypedSchema } from '@vee-validate/zod'
import { LucideAlertCircle, LucideLoader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { userStatusRecord } from '~/constants/constant'

interface Props {
  roles?: Api.Role.List[]
}
interface Emit {
  (e: 'success', user: Api.User.AddForm): void
  (e: 'close'): void
}
defineProps<Props>()
const emit = defineEmits<Emit>()
const mode = ref('add')
const popupTitle = computed(() => {
  return mode.value === 'edit' ? '编辑' : '新增'
})
const open = ref(false)
const avatar = ref()
const loading = ref(false)
const error = ref('')
const { user, refreshUser } = useAuth()
const formSchema = toTypedSchema(z.object({
  id: z.int().optional(),
  username: z.string().min(2, '用户名至少2个字符').max(20, '用户名最多20个字符'),
  password: z.string().min(6, '密码至少6个字符'),
  confirmPassword: z.string().min(1, '不能为空'),
  role_id: z.string().min(1, '不能为空'),
  email: z.email(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended', 'all']),
  forcePasswordChange: z.boolean().default(false).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: '密码不匹配',
  path: ['confirmPassword'],
}))
const { handleSubmit, setValues, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    id: undefined,
    username: '',
    password: '',
    confirmPassword: '',
    role_id: '',
    status: 'active',
  },
})

const formSubmit = handleSubmit(async (form) => {
  if (form.status === 'all') {
    toast('请选择状态')
    return
  }
  loading.value = true
  error.value = ''
  try {
    let result: Api.User.AddForm
    if (mode.value === 'edit') {
      result = await $fetch<Api.User.AddForm>(`/api/systems/users/${values.id}`, {
        method: 'PUT',
        body: {
          ...form,
          status: form.status === 'all' ? null : form.status,
        },
      })
    }
    else {
      result = await $fetch<Api.User.AddForm>('/api/systems/users', {
        method: 'POST',
        body: {
          ...form,
          status: form.status === 'all' ? null : form.status,
        },
      })
    }

    toast.success(mode.value === 'edit' ? '更新成功' : '创建成功')
    emit('success', result)
    open.value = false
    if (form.id && form.id === user.value?.id) {
      refreshUser()
      toast.success('更新当前用户成功')
    }
  }
  catch (err: any) {
    console.error('操作失败:', err)
    error.value = err.data?.message || (mode.value ? '更新失败' : '创建失败')
  }
  finally {
    loading.value = false
  }
})
function setAvatar() {
  avatar.value = createAvatar(lorelei, {
    size: 128,
  }).toDataUri()
}
function setFormData(row: Api.User.AddForm) {
  setValues({ ...row })
  console.log(row, values)
}

function openDialog(type = 'add') {
  mode.value = type
  open.value = true
  setAvatar()
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
        <DialogTitle>{{ popupTitle }}</DialogTitle>
        <DialogDescription>
          <Alert v-if="error" variant="destructive">
            <LucideAlertCircle class="w-4 h-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>
        </DialogDescription>
      </DialogHeader>
      <form class="space-y-4" @submit.prevent="formSubmit">
        <FormField v-slot="{ componentField }" name="avatar">
          <FormItem>
            <FormLabel class="text-sm">
              头像
            </FormLabel>
            <FormControl>
              <div class="flex gap-4">
                <Avatar class="h-8 w-8 rounded-lg">
                  <AvatarImage :src="avatar" v-bind="componentField" alt="@unovue" />
                </Avatar>
                <!-- <Button type="button" class="h-7" @click="setAvatar">
                  随机头像
                </Button> -->
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="username">
          <FormItem>
            <FormLabel class="text-sm required">
              用户名
            </FormLabel>
            <FormControl>
              <Input class="h-7" type="text" placeholder="用户名" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel class="text-sm required">
              邮箱
            </FormLabel>
            <FormControl>
              <Input type="email" class="h-7" placeholder="邮箱" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="phone">
          <FormItem>
            <FormLabel class="text-sm required">
              电话
            </FormLabel>
            <FormControl>
              <Input class="h-7" type="text" placeholder="电话" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel class="text-sm required">
              密码
            </FormLabel>
            <FormControl>
              <Input class="h-7" type="password" placeholder="密码" v-bind="componentField" autocomplete="new-password" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="confirmPassword">
          <FormItem>
            <FormLabel class="text-sm required">
              确认密码
            </FormLabel>
            <FormControl>
              <Input class="h-7" type="password" placeholder="确认密码" v-bind="componentField" autocomplete="new-password" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="role_id">
          <FormItem>
            <FormLabel class="text-sm required">
              角色
            </FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="w-full h-7! px-2 text-sm!">
                  <SelectValue placeholder="选择用户角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="role in roles" :key="role.id" :value="role.id">
                    <div class="flex items-center justify-between w-full">
                      <span>{{ role.name }}</span>
                      <span v-if="role.remark" class="text-gray-500 text-sm ml-4">
                        {{ role.remark }}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="status">
          <FormItem>
            <FormLabel class="text-sm required">
              状态
            </FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="w-full h-7! px-2 text-sm!">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    空
                  </SelectItem>
                  <SelectItem v-for="role in transformRecordToOption(userStatusRecord)" :key="role.value" :value="role.value">
                    <div class="flex items-center justify-between w-full">
                      <span>{{ role.label }}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ value, handleChange }" name="forcePasswordChange"
        >
          <FormItem>
            <FormLabel class="text-sm">
              密码设置
            </FormLabel>
            <FormControl>
              <div class="flex items-center space-x-2 p-3 rounded-lg">
                <Checkbox
                  :model-value="value"
                  @update:model-value="handleChange"
                />
                <Label for="forcePasswordChange" class="text-sm cursor-pointer"> 强制用户下次登录时修改密码 </Label>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <DialogFooter>
          <Button type="button" variant="outline" :disabled="loading" @click="handleClose">
            取消
          </Button>
          <Button type="submit" :disabled="loading" class="min-w-20">
            <LucideLoader2 v-if="loading" class="animate-spin" />
            确定
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
