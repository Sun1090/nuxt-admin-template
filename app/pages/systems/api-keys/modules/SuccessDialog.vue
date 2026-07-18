<script setup lang="ts">
import { Copy } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Emits {
  (e: 'close'): void
}
const emit = defineEmits<Emits>()
const open = ref(false)
const newApiKey = ref()
function formatDate(dateString: string | undefined) {
  if (!dateString)
    return ''
  return new Date(dateString).toLocaleString('zh-CN')
}
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }
  catch (error) {
    console.error('复制失败:', error)
    toast.error('复制失败')
  }
}

async function setFormData(row: Api.ApiKeys.List) {
  newApiKey.value = row
}

async function openDialog() {
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
  <Dialog v-model:open="open" class="max-w-4xl">
    <DialogContent>
      <DialogHeader>
        <DialogTitle> 系统提示</DialogTitle>
        <Dialogremark>
          <Alert variant="default">
            <AlertCircle class="h-4 w-4" />
            <Alertremark>
              API密钥创建成功！
              <p class="text-sm text-success/80 mt-1">
                请妥善保管以下API密钥，它只会显示这一次。
              </p>
            </Alertremark>
          </Alert>
        </Dialogremark>
      </DialogHeader>
      <div v-if="newApiKey" class="space-y-6">
        <div class="space-y-4">
          <h4 class="text-lg font-semibold">
            API密钥信息
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">名称</Label>
              <p class="mt-1">
                {{ newApiKey.name }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">创建者</Label>
              <p class="mt-1">
                {{ newApiKey.creatorName || '--' }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">创建时间</Label>
              <p class="mt-1">
                {{ formatDate(newApiKey.createdAt) }}
              </p>
            </div>
            <div v-if="newApiKey.expiresAt">
              <Label class="text-sm font-medium text-muted-foreground">过期时间</Label>
              <p class="mt-1">
                {{ formatDate(newApiKey.expiresAt) }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <Label class="text-lg font-semibold">完整API密钥</Label>
          <div class="flex space-x-2">
            <Input :value="newApiKey.apiKey" readonly class="font-mono" />
            <Button variant="outline" @click="copyToClipboard(newApiKey.apiKey)">
              <Copy class="h-4 w-4 mr-2" />
              复制
            </Button>
          </div>
          <p class="text-sm text-destructive font-medium">
            ⚠️ 请立即复制并保存此API密钥，关闭此窗口后将无法再次查看完整密钥
          </p>
        </div>

        <div class="space-y-3">
          <Label class="text-lg font-semibold">权限列表</Label>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="permission in newApiKey.permissions" :key="permission" variant="secondary">
              {{ permission }}
            </Badge>
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <Button type="button" @click="handleClose">
            我已保存，关闭窗口
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
