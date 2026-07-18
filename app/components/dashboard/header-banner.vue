<script setup lang="ts">
const { user } = useAuth()
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
})
</script>

<template>
  <div class="flex flex-col space-y-2">
    <ClientOnly>
      <h1 class="text-3xl font-bold tracking-tight">
        控制台
      </h1>
      <p class="text-muted-foreground">
        欢迎回来，{{ user?.username }}！今天是 {{ currentDate }}
      </p>
    </ClientOnly>
  </div>
</template>
