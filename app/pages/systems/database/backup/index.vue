<script setup lang="ts">
// 导入图标
import {
  LucideAlertTriangle,
  LucideDownload,
  LucideFile,
  LucideLoader,
  LucideUpload,
  LucideUploadCloud,
  LucideX,
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
import { Label } from '@/components/ui/label'
import { RadioGroupItem } from '@/components/ui/radio-group'

import { Separator } from '@/components/ui/separator'

// 响应式数据
const createLoading = ref(false)
const uploadLoading = ref(false)
const showCreateModal = ref(false)
const showUploadModal = ref(false)
const selectedFile = ref<File | null>(null)
const isDragOver = ref(false)

// 表单数据
const createForm = ref({
  tables: 'all',
  includeSystemData: true,
})

const restoreForm = ref({
  mode: 'merge',
  clearExisting: false,
})

// 创建备份
async function createBackup() {
  createLoading.value = true
  try {
    const response = await $fetch('/api/admin/backup/export', {
      method: 'POST',
      body: {
        tables: createForm.value.tables,
        includeSystemData: createForm.value.includeSystemData,
      },
    })

    console.log('服务器响应:', response)

    if (response.success && response.backup) {
      const { backup } = response

      // 强制进行浏览器下载
      let dataToDownload

      if (backup.downloadMode === 'direct' && backup.data) {
        // 直接下载模式：服务器返回了完整数据
        dataToDownload = backup.data
        console.log('使用直接下载模式')

        // 创建并下载文件
        try {
          const dataStr = JSON.stringify(dataToDownload, null, 2)
          const blob = new Blob([dataStr], {
            type: 'application/json;charset=utf-8',
          })

          // 创建下载链接
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = backup.filename
          link.style.display = 'none'

          // 添加到DOM，点击，然后移除
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // 清理URL对象
          URL.revokeObjectURL(url)

          // 显示成功消息
          const sizeText = backup.size ? ` (${formatFileSize(backup.size)})` : ''
          toast.success(`备份文件已下载: ${backup.filename}${sizeText}`)

          console.log('✅ 文件下载成功:', backup.filename)
        }
        catch (downloadError) {
          console.error('下载失败:', downloadError)
          toast.error(`文件下载失败: ${downloadError.message}`)
        }
      }
      else if (backup.downloadMode === 'file' && backup.filename) {
        // 文件下载模式：通过API下载文件
        console.log('使用文件下载模式')

        try {
          // 使用 $fetch 进行认证请求，然后创建下载
          const response = await $fetch(
            `/api/admin/backup/download?filename=${encodeURIComponent(backup.filename)}`,
            {
              method: 'GET',
            },
          )

          // 创建 Blob 并下载
          const blob = new Blob([response], {
            type: 'application/json',
          })

          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = backup.filename
          link.style.display = 'none'

          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          URL.revokeObjectURL(url)

          // 显示成功消息
          const sizeText = backup.size ? ` (${formatFileSize(backup.size)})` : ''
          toast.success(`备份文件已下载: ${backup.filename}${sizeText}`)

          console.log('✅ 文件下载成功:', backup.filename)
        }
        catch (downloadError) {
          console.error('文件下载失败:', downloadError)
          toast.error(`文件下载失败: ${downloadError.message}`)
        }
      }
      else {
        console.error('无效的下载模式或缺少数据')
        toast.error('备份创建失败：无效的响应格式')
        showCreateModal.value = false
        return
      }
    }
    else {
      console.error('服务器响应格式错误:', response)
      toast.error('备份创建失败：服务器响应格式错误')
    }

    showCreateModal.value = false
  }
  catch (error: any) {
    console.error('创建备份失败:', error)
    const errorMessage = error.data?.message || error.message || '未知错误'
    toast.error(`创建备份失败: ${errorMessage}`)
  }
  finally {
    createLoading.value = false
  }
}

// 文件选择处理
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

// 拖拽处理
function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}

// 上传文件
async function uploadFile() {
  if (!selectedFile.value)
    return

  uploadLoading.value = true

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('mode', restoreForm.value.mode)
    formData.append('clearExisting', restoreForm.value.clearExisting.toString())

    const response: any = await $fetch('/api/admin/backup/restore', {
      method: 'POST',
      body: formData,
    })

    if (response.success) {
      // 关闭模态框并重置表单
      showUploadModal.value = false
      selectedFile.value = null
      restoreForm.value = { mode: 'merge', clearExisting: false }

      // 显示成功通知
      toast.success(
        `备份恢复成功！处理了 ${response.details?.tablesProcessed || 0} 个表，恢复了 ${
          response.details?.recordsRestored || 0
        } 条记录`,
      )

      // 如果有错误，显示警告
      if (response.details?.errors && response.details.errors.length > 0) {
        setTimeout(() => {
          toast.warning(`恢复过程中发生了 ${response.details.errors.length} 个错误`)
        }, 1000)
      }

      // 显示即将重定向的通知
      setTimeout(() => {
        toast.info('数据库恢复完成，3秒后将返回首页重新登录')
      }, 2000)

      // 清除认证状态并重定向到首页
      setTimeout(() => {
        const { logout } = useAuth()
        logout()
        localStorage.removeItem('auth-token')
        localStorage.removeItem('user-info')
        window.location.href = '/'
      }, 5000)
    }
    else {
      toast.error(`备份导入失败: ${response.message || '未知错误'}`)
    }
  }
  catch (error: any) {
    console.error('导入备份失败:', error)
    toast.error(`导入备份失败: ${error.data?.message || error.message}`)
  }
  finally {
    uploadLoading.value = false
  }
}

// 格式化文件大小
function formatFileSize(bytes: number) {
  if (bytes === 0)
    return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>数据库备份</CardTitle>
      <CardDescription>导出和导入数据库备份</CardDescription>
    </CardHeader>
    <CardContent>
      <!-- 主要功能区 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 导出备份 -->
        <Card>
          <CardContent class="p-6">
            <div class="flex flex-col items-center text-center space-y-4">
              <div class="p-3 bg-blue-100 rounded-full">
                <LucideDownload class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 class="font-semibold">
                  导出备份
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  创建数据库备份文件
                </p>
              </div>
              <Button :disabled="createLoading" class="w-full" @click="showCreateModal = true">
                <LucideLoader v-if="createLoading" class="w-4 h-4 animate-spin mr-2" />
                {{ createLoading ? '导出中...' : '开始导出' }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- 导入备份 -->
        <Card>
          <CardContent class="p-6">
            <div class="flex flex-col items-center text-center space-y-4">
              <div class="p-3 bg-green-100 rounded-full">
                <LucideUpload class="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 class="font-semibold">
                  导入备份
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  从备份文件恢复数据
                </p>
              </div>
              <Button :disabled="uploadLoading" variant="outline" class="w-full" @click="showUploadModal = true">
                <LucideLoader v-if="uploadLoading" class="w-4 h-4 animate-spin mr-2" />
                {{ uploadLoading ? '导入中...' : '选择文件' }}
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
            <div class="space-y-3">
              <Label class="text-base font-medium">备份类型</Label>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem id="backup-all" v-model="createForm.tables" value="all" />
                  <Label for="backup-all" class="flex flex-col">
                    <span class="font-medium">完整备份（推荐）</span>
                    <span class="text-sm text-gray-500">备份所有数据表</span>
                  </Label>
                </div>

                <div class="flex items-center space-x-2">
                  <RadioGroupItem id="backup-users" v-model="createForm.tables" value="users" />
                  <Label for="backup-users" class="flex flex-col">
                    <span class="font-medium">仅用户数据</span>
                    <span class="text-sm text-gray-500">只备份用户相关数据</span>
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

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

      <!-- 导入备份模态框 -->
      <Dialog v-model="showUploadModal">
        <DialogContent class="max-w-md">
          <DialogHeader>
            <DialogTitle>导入备份文件</DialogTitle>
            <DialogDescription> 选择备份文件并设置恢复选项 </DialogDescription>
          </DialogHeader>

          <div class="space-y-4">
            <!-- 文件上传区域 -->
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              :class="{ 'border-blue-400 bg-blue-50': isDragOver }"
              @click="$refs.fileInput.click()"
              @dragover.prevent="isDragOver = true"
              @dragleave="isDragOver = false"
              @drop.prevent="handleDrop"
            >
              <LucideUploadCloud class="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <div class="text-sm text-gray-600">
                <p v-if="!selectedFile">
                  点击选择备份文件或拖拽到此处
                </p>
                <p v-else class="font-medium text-green-600">
                  {{ selectedFile.name }}
                </p>
                <p class="text-xs mt-1">
                  支持 .json 格式的备份文件，最大 100MB
                </p>
              </div>
              <input
                ref="fileInput"
                accept=".json,application/json"
                class="hidden"
                type="file"
                @change="handleFileSelect"
              >
            </div>

            <!-- 选中的文件信息 -->
            <div v-if="selectedFile" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <LucideFile class="w-5 h-5 text-gray-500" />
                <div>
                  <p class="font-medium text-sm">
                    {{ selectedFile.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatFileSize(selectedFile.size) }}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" @click="selectedFile = null">
                <LucideX class="w-4 h-4" />
              </Button>
            </div>

            <!-- 恢复模式 -->
            <div class="space-y-3">
              <Label class="text-base font-medium">恢复模式</Label>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem id="mode-merge" v-model="restoreForm.mode" value="merge" />
                  <Label for="mode-merge" class="flex flex-col">
                    <span class="font-medium">合并模式（推荐）</span>
                    <span class="text-sm text-gray-500">更新现有记录，添加新记录</span>
                  </Label>
                </div>

                <div class="flex items-center space-x-2">
                  <RadioGroupItem id="mode-replace" v-model="restoreForm.mode" value="replace" />
                  <Label for="mode-replace" class="flex flex-col">
                    <span class="font-medium">替换模式</span>
                    <span class="text-sm text-gray-500">先清空数据，然后导入备份</span>
                  </Label>
                </div>
              </div>
            </div>

            <!-- 确认清空数据 -->
            <div v-if="restoreForm.mode === 'replace'" class="flex items-center space-x-2">
              <Checkbox id="clearExisting" v-model:checked="restoreForm.clearExisting" />
              <Label for="clearExisting" class="flex flex-col text-red-600">
                <span class="font-medium">我确认要清空现有数据</span>
                <span class="text-sm">此操作不可逆，请谨慎操作</span>
              </Label>
            </div>

            <!-- 警告信息 -->
            <Alert variant="warning">
              <LucideAlertTriangle class="w-4 h-4" />
              <AlertTitle>注意</AlertTitle>
              <AlertDescription> 导入备份将会影响现有数据，请确保您了解操作的后果。 </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="showUploadModal = false">
              取消
            </Button>
            <Button
              :disabled="
                !selectedFile || uploadLoading || (restoreForm.mode === 'replace' && !restoreForm.clearExisting)
              "
              @click="uploadFile"
            >
              <LucideLoader v-if="uploadLoading" class="w-4 h-4 animate-spin mr-2" />
              开始导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  </Card>
</template>
