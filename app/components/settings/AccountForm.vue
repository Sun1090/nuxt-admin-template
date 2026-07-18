<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import * as z from 'zod'
import { userStatusRecord } from '~/constants/constant'

const { user, refreshUser } = useAuth()
const loading = ref(false)
// 表单验证 schema - 基于用户系统信息
const profileFormSchema = toTypedSchema(z.object({
  username: z
    .string()
    .min(2, {
      message: '用户名必须至少包含2个字符',
    })
    .max(30, {
      message: '用户名不能超过30个字符',
    }),
  email: z.email('请输入有效的邮箱地址'),
  status: z.enum(['active', 'inactive', 'suspended', 'all']).optional(),
  forcePasswordChange: z.boolean().optional(),
}))

const { handleSubmit, setValues, resetForm } = useForm({
  validationSchema: profileFormSchema,
})

const userData = ref<Api.User.AddForm>({
  id: 0,
  username: '',
  role_id: '',
  role_name: '',
  status: 'active',
  last_login: '',
  lastLoginIp: '',
  forcePasswordChange: false,
  passwordChangedAt: '',
  created_at: '',
  updated_at: '',
})

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  try {
    // 调用更新用户信息的 API
    await $fetch(`/api/systems/users/${user.value?.id}`, {
      method: 'PUT',
      body: { ...userData.value, ...values },
    })
    toast.success('用户信息更新成功')
    // 更新本地数据
    userData.value = { ...userData.value, ...values }
    refreshUser()
  }
  catch (error: any) {
    console.error('更新用户信息失败:', error)
    toast.error(error.data?.message || '更新失败')
  }
  finally {
    loading.value = false
  }
})

// 开始编辑
function startEditing() {
  // 设置表单值为当前数据
  setValues({
    username: userData.value.username,
    email: userData.value.email || '',
    status: userData.value.status || 'inactive',
    forcePasswordChange: userData.value.forcePasswordChange || false,
  })
}

// 取消编辑
function reset() {
  // 重置表单
  resetForm()
}

// 格式化日期时间
function formatDateTime(dateTimeStr: string) {
  if (!dateTimeStr)
    return '从未登录'
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN')
}

async function getUser() {
  try {
    const data = await $fetch<{ data: Api.User.AddForm }>(`/api/systems/users/${user.value?.id}`, {
      method: 'GET',
    })
    console.log(data)
    userData.value = data.data
    startEditing()
  }
  catch (error: any) {
    toast.error(error.data?.message || '获取用户信息失败')
  }
}

getUser()
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium">
          用户信息
        </h3>
        <p class="text-sm text-muted-foreground">
          管理系统用户账户信息
        </p>
      </div>
    </div>
  </div>
  <Separator />

  <form class="space-y-6" @submit="onSubmit">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField v-slot="{ componentField }" name="username">
        <FormItem>
          <FormLabel class="required">
            用户名
          </FormLabel>
          <FormControl>
            <Input type="text" placeholder="请输入用户名" v-bind="componentField" />
          </FormControl>
          <FormDescription>
            用于登录系统的用户名
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel class="required">
            邮箱地址
          </FormLabel>
          <FormControl>
            <Input type="email" placeholder="请输入邮箱地址" v-bind="componentField" />
          </FormControl>
          <FormDescription>
            用于接收系统通知和重置密码
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField v-slot="{ componentField }" name="status">
        <FormItem>
          <FormLabel class="required">
            账户状态
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="option in transformRecordToOption(userStatusRecord)" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            控制用户是否可以登录系统
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ value, handleChange }" name="forcePasswordChange">
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
    </div>

    <!-- 只读信息 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/50">
      <div>
        <label class="text-sm font-medium">用户ID</label>
        <p class="text-sm mt-1">
          {{ userData.id }}
        </p>
      </div>
      <div>
        <label class="text-sm font-medium">手机号</label>
        <p class="text-sm mt-1">
          {{ userData.phone || '未设置' }}
        </p>
      </div>
      <div>
        <label class="text-sm font-medium">角色</label>
        <p class="text-sm mt-1">
          {{ userData.role_name || '未分配角色' }}
        </p>
      </div>
      <div>
        <label class="text-sm font-medium">最后登录</label>
        <p class="text-sm mt-1">
          {{ userData.last_login ? formatDateTime(userData.last_login) : '--' }}
        </p>
      </div>
    </div>

    <div class="flex justify-start gap-3 pt-4">
      <Button type="submit" :disabled="loading" class="min-w-20">
        <LucideLoader2 v-if="loading" class="animate-spin" />
        确定
      </Button>
      <Button
        type="button"
        variant="outline"
        @click="reset"
      >
        重置
      </Button>
    </div>
  </form>
</template>

<style scoped>
.required::after {
  content: ' *';
  color: #ef4444;
}
</style>
