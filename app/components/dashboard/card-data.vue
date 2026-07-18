<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'
import { Key, Shield, UserCheck, Users } from 'lucide-vue-next'

interface CardData {
  key: string
  title: string
  value: number
  unit: string
  color: {
    start: string
    end: string
  }
  icon: string
}
interface GradientBgProps {
  gradientColor: string
}

const [DefineGradientBg, GradientBg] = createReusableTemplate<GradientBgProps>()

function getGradientColor(color: CardData['color']) {
  return `linear-gradient(to bottom right, ${color.start}, ${color.end})`
}
const { data: stats, refresh } = useAsyncData(
  'dashboard-stats',
  () => $fetch('/api/dashboard/stats'),
)
refresh()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <DefineGradientBg v-slot="{ $slots, gradientColor }">
      <div class="rd-8px px-16px pb-4px pt-8px text-white" :style="{ backgroundImage: gradientColor }">
        <component :is="$slots.default" />
      </div>
    </DefineGradientBg>

    <!-- 总用户数 -->
    <Card class="p-0">
      <GradientBg
        :gradient-color="getGradientColor({
          start: '#ec4786',
          end: '#b955a4',
        })" class="flex-1 p-4 rounded-sm"
      >
        <CardHeader class="flex px-0 flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle class="text-lg font-medium">
            用户总数
          </CardTitle>
          <Users class="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent class="flex px-0 justify-between items-center">
          <p class="text-xs text-muted">
            系统注册用户
          </p>
          <div class="text-3xl text-black font-bold">
            {{ stats?.totalUsers || 0 }}
          </div>
        </CardContent>
      </GradientBg>
    </Card>

    <!-- 活跃用户 -->
    <Card class="p-0">
      <GradientBg
        :gradient-color="getGradientColor({
          start: '#865ec0',
          end: '#5144b4',
        })" class="flex-1 p-4 rounded-sm"
      >
        <CardHeader class="flex px-0 flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle class="text-lg font-medium">
            活跃用户
          </CardTitle>
          <UserCheck class="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent class="flex px-0 justify-between items-center">
          <p class="text-xs text-muted">
            当前活跃账户
          </p>
          <div class="text-3xl text-black font-bold">
            {{ stats?.activeUsers || 0 }}
          </div>
        </CardContent>
      </GradientBg>
    </Card>

    <!-- 角色数量 -->
    <Card class="p-0">
      <GradientBg
        :gradient-color="getGradientColor({
          start: '#56cdf3',
          end: '#719de3',
        })" class="flex-1 p-4 rounded-sm"
      >
        <CardHeader class="flex px-0 flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle class="text-lg font-medium">
            角色数量
          </CardTitle>
          <Shield class="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent class="flex px-0 justify-between items-center">
          <p class="text-xs text-muted">
            系统角色总数
          </p>
          <div class="text-3xl text-black font-bold">
            {{ stats?.totalRoles || 0 }}
          </div>
        </CardContent>
      </GradientBg>
    </Card>

    <!-- 权限数量 -->
    <Card class="p-0">
      <GradientBg
        :gradient-color="getGradientColor({
          start: '#fcbc25',
          end: '#f68057',
        })" class="flex-1 p-4 rounded-sm"
      >
        <CardHeader class="flex px-0 flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle class="text-lg font-medium">
            权限数量
          </CardTitle>
          <Key class="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent class="flex px-0 justify-between items-center">
          <p class="text-xs text-dark">
            系统权限总数
          </p>
          <div class="text-3xl text-black font-bold">
            {{ stats?.totalPermissions || 0 }}
          </div>
        </CardContent>
      </GradientBg>
    </Card>
  </div>
</template>
