<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import {
  LucideLoader,
} from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

interface Emits {
  (e: 'success',): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()
const open = ref(false)
const loading = ref(false)
const allPermissions = ref<Api.Permission.List[]>([])
const formSchema = toTypedSchema(z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  roleIds: z.array(z.string()),
}))

const { handleSubmit, setValues, validate, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    roleIds: [],
  },
})
// 权限分类配置
const permissionCategories = [
  { key: 'page', label: '页面权限' },
  { key: 'menu', label: '菜单权限' },
  { key: 'action', label: '操作权限' },
  { key: 'feature', label: '功能权限' },
]

// 计算属性

// 方法
function getPermissionsByCategory(category: string) {
  return allPermissions.value.filter(p => p.category === category)
}

function getCategoryCount(category: string) {
  const categoryPermissions = getPermissionsByCategory(category)
  const selected = categoryPermissions.filter(p => values.roleIds?.includes(p.id))
  return `${selected.length}/${categoryPermissions.length}`
}

function selectAll() {
  setValues({
    roleIds: Array.from(new Set(allPermissions.value.map(p => p.id))),
  })
}

function clearAll() {
  setValues({
    roleIds: [],
  })
}

async function loadPermissions() {
  try {
    const data = await $fetch<Api.Permission.List[]>('/api/systems/permissions')
    allPermissions.value = data
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (error) {
    toast.error('加载权限失败')
  }
}

async function loadRolePermissions() {
  try {
    const data = await $fetch<{ permissions: Api.Permission.List[] }>(`/api/systems/roles/${values?.id}/permissions`)
    const arr = new Set(data.permissions.map(p => p.id))
    setTimeout(() => {
      setValues({
        roleIds: Array.from(arr),
      })
    }, 200)
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (error) {
    toast.error('加载角色权限失败')
  }
}

const onSubmit = handleSubmit(async (form) => {
  await validate()
  try {
    loading.value = true
    await $fetch(`/api/systems/roles/${values.id}/permissions`, {
      method: 'PUT',
      body: {
        permissionroleIds: form.roleIds,
      },
    })
    toast.success('更新成功')
    emit('success')
    open.value = false
  }
  catch (error: any) {
    toast.error(error.data?.message || '保存失败')
  }
  finally {
    loading.value = false
  }
})
function setFormData(row: Record<any, any>) {
  setValues({
    id: row.id,
    name: row.name,
  })
}

async function openDialog() {
  open.value = true
  loadPermissions()
  loadRolePermissions()
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
        <DialogTitle> 权限管理 - {{ values?.name }} </DialogTitle>
        <DialogDescription />
      </DialogHeader>

      <div class="max-h-[80vh] overflow-y-auto">
        <form @submit="onSubmit">
          <!-- 权限分类 -->
          <div v-for="category in permissionCategories" :key="category.key" class="mb-6">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
              {{ category.label }}
              <Badge variant="outline">
                {{ getCategoryCount(category.key) }}
              </Badge>
            </h3>

            <div class="grid gap-2">
              <FormField
                v-for="permission in getPermissionsByCategory(category.key)"
                :key="permission.id"
                v-slot="{ value, handleChange }"
                class="flex items-center gap-3 p-3 border rounded-lg transition-colors"
                type="checkbox"
                :value="permission.id"
                :unchecked-value="false"
                name="roleIds"
              >
                <FormItem class="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      :model-value="value.includes(permission.id)"
                      @update:model-value="handleChange"
                    />
                  </FormControl>
                  <FormLabel class="font-normal">
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="font-medium">
                          {{ permission.name }}
                        </p>
                        <p class="text-sm text-gray-600 mt-1">
                          {{ permission.remark }}
                        </p>
                        <div v-if="permission.resource || permission.action" class="flex gap-2 mt-1">
                          <Badge v-if="permission.resource" variant="secondary" size="sm">
                            {{ permission.resource }}
                          </Badge>
                          <Badge v-if="permission.action" variant="outline" size="sm">
                            {{ permission.action }}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </FormLabel>
                </FormItem>
              </FormField>
            </div>
          </div>
        </form>
      </div>

      <DialogFooter class="flex justify-between items-center">
        <div class="text-sm text-gray-600">
          已选择 {{ values.roleIds?.length }} / {{ allPermissions.length }} 个权限
        </div>
        <div class="flex gap-2">
          <Button type="button" variant="outline" @click="handleClose">
            取消
          </Button>
          <Button type="button" variant="outline" @click="selectAll">
            全选
          </Button>
          <Button type="button" variant="outline" @click="clearAll">
            清空
          </Button>
          <Button type="submit" :disabled="loading">
            <LucideLoader v-if="loading" class="w-4 h-4 animate-spin mr-2" />
            保存更改
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
