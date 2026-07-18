<script setup lang="ts">
import { LucideRefreshCw, LucideSearch } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Emits {
  (e: 'search'): void
  (e: 'reset'): void
}

const emit = defineEmits<Emits>()
const model = defineModel<Api.ApiKeys.ListSearchParams>('model', {
  required: true,
})

function handleSearch() {
  emit('search')
}

function handleReset() {
  emit('reset')
}
</script>

<template>
  <Card class="card-search gap-0">
    <CardHeader>
      <CardTitle> 搜索 </CardTitle>
    </CardHeader>
    <CardContent class="text-sm">
      <form class="flex flex-wrap items-center justify-between gap-4" @submit.prevent="handleSearch">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex gap-2">
            <Input id="search-name" v-model="model.name" class="flex-1 h-7" placeholder="搜索API密钥名称或描述">
              <template #prefix>
                <LucideSearch />
              </template>
            </Input>
          </div>
          <div class="flex gap-2">
            <Label class="text-sm" for="search-name"> 名称 </Label>
            <Select v-model="model.status">
              <SelectTrigger class="h-7!">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  全部
                </SelectItem>
                <SelectItem value="active">
                  活跃
                </SelectItem>
                <SelectItem value="inactive">
                  非活跃
                </SelectItem>
                <SelectItem value="expired">
                  已过期
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="space-x-2 text-sm">
          <Button type="submit" class="h-7">
            <LucideSearch />
            查询
          </Button>
          <Button type="button" class="h-7" variant="outline" @click="handleReset">
            <LucideRefreshCw />
            重置
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
