<script setup>
definePageMeta({
  layout: 'blank',
})

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <div class="h-svh">
    <div class="m-auto h-full w-full flex flex-col items-center justify-center gap-2">
      <h1 class="text-[7rem] font-bold leading-tight">
        403
      </h1>
      <span class="font-medium">{{ t('error.forbidden') }}</span>
      <p class="text-center text-muted-foreground">
        {{ t('error.forbiddenDesc') }}
      </p>
      <div class="mt-6 flex gap-4">
        <Button variant="outline" @click="router.back()">
          {{ t('error.goBack') }}
        </Button>
        <Button @click="router.push('/')">
          {{ t('error.backHome') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>