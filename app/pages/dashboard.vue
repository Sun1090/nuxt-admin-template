<!-- pages/dashboard.vue -->
<script setup lang="ts">
import CardData from '~/components/dashboard/card-data.vue'
import HeaderBanner from '~/components/dashboard/header-banner.vue'
import QuickActions from '~/components/dashboard/quick-actions.vue'
</script>

<template>
  <div class="min-h-screen space-y-6">
    <HeaderBanner />
    <CardData />

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <!-- 在此放置业务内容 -->
      </div>
      <div>
        <QuickActions />
      </div>
    </div>
  </div>
</template>
