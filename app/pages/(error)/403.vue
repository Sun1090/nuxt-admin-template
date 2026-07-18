<script setup>
definePageMeta({
  layout: 'blank',
})

const router = useRouter()
</script>

<template>
  <div class="h-svh">
    <div class="m-auto h-full w-full flex flex-col items-center justify-center gap-2">
      <h1 class="text-[7rem] font-bold leading-tight">
        403
      </h1>
      <span class="font-medium">访问被禁止</span>
      <p class="text-center text-muted-foreground">
        您没有权限<br>
        查看该资源。
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
