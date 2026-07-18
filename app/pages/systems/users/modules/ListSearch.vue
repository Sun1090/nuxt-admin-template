<script setup lang="ts">
import { LucideRefreshCw, LucideSearch } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { userStatusRecord } from '~/constants/constant'

interface Props {
  roles: Api.Role.List[]
}
interface Emits {
  (e: 'search'): void
  (e: 'reset'): void
}
defineProps<Props>()

const emit = defineEmits<Emits>()

const model = defineModel<Api.User.ListSearchParams>('model', {
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
            <Label class="text-sm" for="search-username"> 用户名 </Label>
            <Input id="search-username" v-model="model.username" class="flex-1 h-7" placeholder="用户名">
              <template #prefix>
                <LucideSearch />
              </template>
            </Input>
          </div>

          <div class="flex gap-2">
            <Label for="search-status" class="text-sm">状态</Label>
            <Select v-model="model.status" class="h-1">
              <SelectTrigger class="h-7! px-2 text-sm!">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  全部
                </SelectItem>
                <SelectItem v-for="(item, index) in transformRecordToOption(userStatusRecord)" :key="index" :value="item.value">
                  {{ item.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 角色筛选 -->
          <div class="flex gap-2">
            <Label for="search-role" class="text-sm">角色</Label>
            <Select v-model="model.role">
              <SelectTrigger class="h-7! px-2 text-sm!">
                <SelectValue placeholder="角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  全部
                </SelectItem>
                <SelectItem v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
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
