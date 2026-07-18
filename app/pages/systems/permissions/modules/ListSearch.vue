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
const model = defineModel<Api.Permission.ListSearchParams>('model', {
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
            <Label class="text-sm" for="search-name"> 名称 </Label>
            <Input id="search-name" v-model="model.name" class="flex-1 h-7" placeholder="名称">
              <template #prefix>
                <LucideSearch />
              </template>
            </Input>
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
