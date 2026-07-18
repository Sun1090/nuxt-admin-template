<script setup lang="ts">
// 导入图标
import {
  LucideAlertTriangle,
  LucideDownload,
  LucideInfo,
  LucideLoader,
  LucideRefreshCw,
  LucideUpload,
  LucideUploadCloud,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
// 导入组件
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// 响应式数据
const showCreateModal = ref(false)
const showUploadModal = ref(false)
const showResetModal = ref(false)
const showSequenceModal = ref(false)
const createLoading = ref(false)
const uploadLoading = ref(false)
const resetLoading = ref(false)
const sequenceLoading = ref(false)
const selectedFile = ref<File | null>(null)
const resetConfirmText = ref('')

// 表单数据
const createForm = ref({
  includeRoles: true,
  includeUsers: true,
  includeSystemData: true,
})

const restoreForm = ref({
  mode: 'merge',
})

const sequenceForm = ref({
  table: '',
})

// 文件选择处理
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type === 'application/json') {
    selectedFile.value = file
  }
  else {
    toast.error('请选择有效的JSON备份文件')
  }
}

// 拖拽文件处理
function handleFileDrop(event: DragEvent) {
  const file = event.dataTransfer?.files[0]
  if (file && file.type === 'application/json') {
    selectedFile.value = file
  }
  else {
    toast.error('请选择有效的JSON备份文件')
  }
}

// 创建备份
async function createBackup() {
  createLoading.value = true
  try {
    const response = await $fetch('/api/admin/backup/export', {
      method: 'POST',
      body: createForm.value,
    })

    if (response.success && response.backup) {
      // 处理直接下载模式
      if (response.backup.downloadMode === 'direct' && response.backup.data) {
        const blob = new Blob([JSON.stringify(response.backup.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = response.backup.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('备份文件已下载')
        showCreateModal.value = false
      }
      else if (response.backup.downloadMode === 'file' && response.backup.filename) {
        // 处理文件模式
        const downloadUrl = `/api/admin/backup/download/${response.backup.filename}`
        const downloadResponse = await fetch(downloadUrl, {
          method: 'GET',
          credentials: 'include',
        })

        if (!downloadResponse.ok) {
          throw new Error(`下载失败: ${downloadResponse.status}`)
        }

        const blob = await downloadResponse.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = response.backup.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('备份文件已下载')
        showCreateModal.value = false
      }
      else {
        toast.success('备份创建成功')
        showCreateModal.value = false
      }
    }
    else {
      throw new Error(response.message || '备份创建失败')
    }
  }
  catch (error: any) {
    console.error('创建备份失败:', error)
    toast.error(`创建备份失败: ${error.message}`)
  }
  finally {
    createLoading.value = false
  }
}

// 恢复备份
async function restoreBackup() {
  if (!selectedFile.value) {
    toast.error('请选择备份文件')
    return
  }

  uploadLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('mode', restoreForm.value.mode)
    formData.append('clearExisting', restoreForm.value.mode === 'replace')

    const response = await $fetch('/api/admin/backup/restore', {
      method: 'POST',
      body: formData,
    })

    if (response.success) {
      showUploadModal.value = false
      selectedFile.value = null

      toast.success('数据恢复成功！')

      setTimeout(() => {
        toast.info('数据库恢复完成，3秒后将返回首页重新登录')
      }, 1500)

      // 清除认证状态并重定向到首页
      setTimeout(() => {
        const { logout } = useAuth()
        logout()
        localStorage.removeItem('auth-token')
        localStorage.removeItem('user-info')
        window.location.href = '/'
      }, 4500)
    }
    else {
      throw new Error(response.message || '数据恢复失败')
    }
  }
  catch (error: any) {
    console.error('恢复备份失败:', error)
    toast.error(`恢复备份失败: ${error.message}`)
  }
  finally {
    uploadLoading.value = false
  }
}

// 重置数据库
async function resetDatabase() {
  if (resetConfirmText.value !== 'CONFIRM-DATABASE-RESET-OPERATION') {
    toast.error('请输入 CONFIRM-DATABASE-RESET-OPERATION 确认操作')
    return
  }

  resetLoading.value = true
  try {
    const response = await $fetch('/api/admin/database/reset', {
      method: 'POST',
    })

    if (response.success) {
      showResetModal.value = false
      resetConfirmText.value = ''

      toast.success('数据库重置成功！')

      setTimeout(() => {
        toast.info('数据库重置完成，3秒后将返回首页重新登录')
      }, 1500)

      setTimeout(() => {
        const { logout } = useAuth()
        logout()
        localStorage.removeItem('auth-token')
        localStorage.removeItem('user-info')
        window.location.href = '/'
      }, 4500)
    }
    else {
      throw new Error(response.message || '数据库重置失败')
    }
  }
  catch (error: any) {
    console.error('重置数据库失败:', error)
    toast.error(`重置数据库失败: ${error.message}`)
  }
  finally {
    resetLoading.value = false
  }
}

// 重置序列
async function resetSequence() {
  if (!sequenceForm.value.table) {
    toast.error('请选择要重置序列的数据表')
    return
  }

  sequenceLoading.value = true
  const selectedTable = sequenceForm.value.table

  try {
    const response = await $fetch('/api/admin/fix-sequence', {
      method: 'POST',
      body: {
        table: selectedTable,
      },
    })

    if (response.success) {
      showSequenceModal.value = false
      sequenceForm.value.table = ''

      const successMessage = selectedTable === 'all' ? '所有表的序列重置成功！' : `${selectedTable}表的序列重置成功！`
      toast.success(successMessage)
    }
    else {
      throw new Error(response.error || '序列重置失败')
    }
  }
  catch (error: any) {
    console.error('重置序列失败:', error)
    toast.error(`重置序列失败: ${error.message}`)
  }
  finally {
    sequenceLoading.value = false
  }
}
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>数据库操作</CardTitle>
      <CardDescription>数据库备份、恢复和重置操作</CardDescription>
    </CardHeader>
    <CardContent>
      <!-- 操作卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 创建备份 -->
        <Card>
          <CardContent class="p-6">
            <div class="flex flex-col items-center text-center space-y-4">
              <div class="p-3 bg-blue-100 rounded-full">
                <LucideDownload class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 class="font-semibold">
                  创建备份
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  导出当前数据库数据
                </p>
              </div>
              <Button :disabled="createLoading" class="w-full" @click="showCreateModal = true">
                <LucideLoader v-if="createLoading" class="w-4 h-4 animate-spin mr-2" />
                {{ createLoading ? '创建中...' : '创建备份' }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- 恢复备份 -->
        <Card>
          <CardContent class="p-6">
            <div class="flex flex-col items-center text-center space-y-4">
              <div class="p-3 bg-green-100 rounded-full">
                <LucideUpload class="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 class="font-semibold">
                  恢复备份
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  从备份文件恢复数据
                </p>
              </div>
              <Button :disabled="uploadLoading" variant="outline" class="w-full" @click="showUploadModal = true">
                <LucideLoader v-if="uploadLoading" class="w-4 h-4 animate-spin mr-2" />
                {{ uploadLoading ? '恢复中...' : '选择文件' }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- 重置序列 -->
        <Card>
          <CardContent class="p-6">
            <div class="flex flex-col items-center text-center space-y-4">
              <div class="p-3 bg-amber-100 rounded-full">
                <LucideRefreshCw class="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 class="font-semibold">
                  重置序列
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  修复数据表的自增序列
                </p>
              </div>
              <Button :disabled="sequenceLoading" variant="outline" class="w-full" @click="showSequenceModal = true">
                <LucideLoader v-if="sequenceLoading" class="w-4 h-4 animate-spin mr-2" />
                {{ sequenceLoading ? '重置中...' : '重置序列' }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- 重置数据库 -->
        <Card class="border-red-200">
          <CardContent class="p-6">
            <div class="flex flex-col items-center text-center space-y-4">
              <div class="p-3 bg-red-100 rounded-full">
                <LucideAlertTriangle class="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 class="font-semibold">
                  重置数据库
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  清空所有数据（危险操作）
                </p>
              </div>
              <Button :disabled="resetLoading" variant="destructive" class="w-full" @click="showResetModal = true">
                <LucideLoader v-if="resetLoading" class="w-4 h-4 animate-spin mr-2" />
                {{ resetLoading ? '重置中...' : '重置数据库' }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 创建备份模态框 -->
      <Dialog v-model="showCreateModal">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建数据库备份</DialogTitle>
            <DialogDescription> 选择要包含在备份中的数据 </DialogDescription>
          </DialogHeader>

          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <Checkbox id="includeRoles" v-model:checked="createForm.includeRoles" />
              <Label for="includeRoles" class="flex flex-col">
                <span class="font-medium">包含角色数据</span>
                <span class="text-sm text-gray-500">包含所有角色和权限信息</span>
              </Label>
            </div>

            <div class="flex items-center space-x-2">
              <Checkbox id="includeUsers" v-model:checked="createForm.includeUsers" />
              <Label for="includeUsers" class="flex flex-col">
                <span class="font-medium">包含用户数据</span>
                <span class="text-sm text-gray-500">包含用户账户和权限信息</span>
              </Label>
            </div>

            <div class="flex items-center space-x-2">
              <Checkbox id="includeSystemData" v-model:checked="createForm.includeSystemData" />
              <Label for="includeSystemData" class="flex flex-col">
                <span class="font-medium">包含系统设置</span>
                <span class="text-sm text-gray-500">包含系统配置和设置数据</span>
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="showCreateModal = false">
              取消
            </Button>
            <Button :disabled="createLoading" @click="createBackup">
              <LucideLoader v-if="createLoading" class="w-4 h-4 animate-spin mr-2" />
              创建备份
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- 恢复备份模态框 -->
      <Dialog v-model="showUploadModal">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>恢复数据库备份</DialogTitle>
            <DialogDescription> 选择备份文件并设置恢复选项 </DialogDescription>
          </DialogHeader>

          <div class="space-y-4">
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              @click="$refs.fileInput.click()"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
            >
              <LucideUploadCloud class="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <div class="text-sm text-gray-600">
                <p v-if="!selectedFile">
                  点击选择备份文件或拖拽到此处
                </p>
                <p v-else class="font-medium text-green-600">
                  {{ selectedFile.name }}
                </p>
              </div>
              <input ref="fileInput" accept=".json" class="hidden" type="file" @change="handleFileSelect">
            </div>

            <div class="space-y-2">
              <Label for="restoreMode">恢复模式</Label>
              <Select v-model="restoreForm.mode">
                <SelectTrigger>
                  <SelectValue placeholder="选择恢复模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merge">
                    合并模式（保留现有数据）
                  </SelectItem>
                  <SelectItem value="replace">
                    替换模式（清空后恢复）
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert variant="warning">
              <LucideAlertTriangle class="w-4 h-4" />
              <AlertTitle>注意</AlertTitle>
              <AlertDescription> 恢复备份将会影响现有数据，请确保您了解操作的后果。 </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="showUploadModal = false">
              取消
            </Button>
            <Button :disabled="uploadLoading || !selectedFile" @click="restoreBackup">
              <LucideLoader v-if="uploadLoading" class="w-4 h-4 animate-spin mr-2" />
              开始恢复
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- 重置序列模态框 -->
      <Dialog v-model="showSequenceModal">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置数据表序列</DialogTitle>
            <DialogDescription> 修复数据表的自增ID序列 </DialogDescription>
          </DialogHeader>

          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="sequenceTable">选择数据表</Label>
              <Select v-model="sequenceForm.table">
                <SelectTrigger>
                  <SelectValue placeholder="选择要重置序列的数据表" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    重置所有表
                  </SelectItem>
                  <SelectItem value="users">
                    用户表
                  </SelectItem>
                  <SelectItem value="roles">
                    角色表
                  </SelectItem>
                  <SelectItem value="permissions">
                    权限表
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <LucideInfo class="w-4 h-4" />
              <AlertTitle>说明</AlertTitle>
              <AlertDescription>
                重置序列将修复数据表的自增ID序列，确保新记录的ID从正确的值开始。
                此操作不会影响现有数据，只会调整序列的下一个值。
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="showSequenceModal = false">
              取消
            </Button>
            <Button variant="outline" :disabled="sequenceLoading || !sequenceForm.table" @click="resetSequence">
              <LucideLoader v-if="sequenceLoading" class="w-4 h-4 animate-spin mr-2" />
              重置序列
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- 重置数据库模态框 -->
      <Dialog v-model="showResetModal">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置数据库</DialogTitle>
            <DialogDescription> 此操作将永久删除所有数据 </DialogDescription>
          </DialogHeader>

          <div class="space-y-4">
            <Alert variant="destructive">
              <LucideAlertTriangle class="w-4 h-4" />
              <AlertTitle>危险操作警告</AlertTitle>
              <AlertDescription>
                此操作将永久删除数据库中的所有内容，包括：
                <ul class="list-disc list-inside mt-2 space-y-1">
                  <li>所有用户账户（除当前管理员）</li>
                  <li>所有角色和权限配置</li>
                  <li>所有系统设置</li>
                  <li>所有API密钥和日志</li>
                </ul>
                <p class="mt-2 font-semibold">
                  此操作不可撤销！
                </p>
              </AlertDescription>
            </Alert>

            <div class="space-y-2">
              <Label for="resetConfirm"> 请输入 "CONFIRM-DATABASE-RESET-OPERATION" 确认操作 </Label>
              <Input
                id="resetConfirm"
                v-model="resetConfirmText"
                placeholder="输入 CONFIRM-DATABASE-RESET-OPERATION 确认"
                @input="resetConfirmText = $event.target.value.toUpperCase()"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="showResetModal = false">
              取消
            </Button>
            <Button
              variant="destructive"
              :disabled="resetLoading || resetConfirmText !== 'CONFIRM-DATABASE-RESET-OPERATION'"
              @click="resetDatabase"
            >
              <LucideLoader v-if="resetLoading" class="w-4 h-4 animate-spin mr-2" />
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  </Card>
</template>
