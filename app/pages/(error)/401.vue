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
        401
      </h1>
      <span class="font-medium">未经授权的访问</span>
      <p class="text-center text-muted-foreground">
        请使用适当的凭据<br>登录以访问此资源。
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
