<script setup>
const { theme } = useAppSettings()

useHead({
  bodyAttrs: {
    class: computed(() => `color-${theme.value?.color || 'default'} theme-${theme.value?.type || 'default'}`),
  },
})

const router = useRouter()
</script>

<template>
  <div class="h-svh">
    <div class="m-auto h-full w-full flex flex-col items-center justify-center gap-2">
      <h1 class="text-[7rem] font-bold leading-tight">
        404
      </h1>
      <span class="font-medium">页面未找到！</span>
      <p class="text-center text-muted-foreground">
        看起来您要找的页面<br>
        不存在或可能已被删除。
      </p>
      <div class="mt-6 flex gap-4">
        <Button variant="outline" @click="router.back()">
          返回
        </Button>
        <Button @click="router.push('/')">
          返回首页
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
