<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import PasswordInput from '~/components/PasswordInput.vue'

definePageMeta({
  layout: 'blank',
  // 添加这个，避免服务端中间件处理
  auth: false,
})

const { t } = useI18n()
const isLoading = ref(false)
const rememberMe = ref(false)
const error = ref('')
const auth = useAuth()
const formSchema = toTypedSchema(z.object({
  username: z.string().min(1, t('auth.username')),
  password: z.string().min(1, t('auth.password')),
}))
const { handleSubmit, setValues, validate } = useForm({
  validationSchema: formSchema,
})
const onSubmit = handleSubmit(async (form) => {
  await validate().then(() => {
    // if (val.valid) {}
  })
  isLoading.value = true
  error.value = ''
  try {
    await auth.login(form.username, form.password)
    if (rememberMe.value) {
      window.localStorage.setItem('accountInfo', JSON.stringify({
        username: form.username,
        password: form.password,
      }))
    }
    else {
      window.localStorage.removeItem('accountInfo')
    }
    if (auth.isAuthenticated.value) {
      await navigateTo('/dashboard')
    }
    else {
      await navigateTo('/')
    }
  }
  catch (err: any) {
    error.value = err.message || t('auth.loginFailed')
  }
  finally {
    isLoading.value = false
  }
})
function init() {
  const accountInfoJson = window.localStorage.getItem('accountInfo')
  if (accountInfoJson) {
    try {
      const accountInfo = JSON.parse(accountInfoJson)
      rememberMe.value = true
      setValues({
        username: accountInfo.username,
        password: accountInfo.password,
      })
    }
    catch (e) {
      console.error(t('common.error'), e)
      window.localStorage.removeItem('accountInfo')
    }
  }
}
onMounted(() => {
  nextTick()
  init()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6 bg-muted p-6 min-h-svh md:p-10">
    <div class="max-w-md w-full flex flex-col gap-6">
      <NuxtLink to="#" class="flex items-center self-center gap-2 font-medium">
        <div class="h-6 w-6 flex items-center justify-center rounded-md bg-primary text-primary-foreground">
          <img src="/logo.png">
        </div>
        {{ t('app.name') }}
      </NuxtLink>
      <div class="flex flex-col gap-6">
        <Card>
          <CardHeader class="text-center">
            <CardTitle class="text-xl">
              {{ t('auth.welcome') }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form class="grid gap-6" @submit="onSubmit">
              <FormField v-slot="{ componentField }" name="username">
                <FormItem>
                  <FormLabel class="text-sm">
                    {{ t('auth.username') }}
                  </FormLabel>
                  <FormControl>
                    <Input class="h-7" type="text" :placeholder="t('auth.username')" v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormField v-slot="{ componentField }" name="password">
                <FormItem>
                  <FormLabel class="text-sm">
                    {{ t('auth.password') }}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput class="h-7" :placeholder="t('auth.password')" v-bind="componentField" autocomplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <div class="flex justify-between">
                <span class="text-sm flex items-center gap-2">
                  <Checkbox v-model="rememberMe" />
                  {{ t('auth.rememberMe') }}
                </span>
              </div>
              <Button type="submit" class="w-full" :disabled="isLoading">
                <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                {{ t('auth.login') }}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>