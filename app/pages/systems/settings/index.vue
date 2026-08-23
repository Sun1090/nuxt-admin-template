<script setup lang="ts">
import { Loader2, Save } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const loading = ref(false)
const saving = ref(false)

const form = ref({
  siteTitle: '',
  siteLogoUrl: '',
  siteDescription: '',
  icpNumber: '',
  loginBgUrl: '',
  enableRegistration: false,
  enableCaptcha: false,
  defaultUserRole: '',
})

async function loadSettings() {
  loading.value = true
  try {
    const res = await $fetch<{ data: any }>('/api/systems/settings')
    if (res.data) {
      Object.assign(form.value, {
        siteTitle: res.data.siteTitle || '',
        siteLogoUrl: res.data.siteLogoUrl || '',
        siteDescription: res.data.siteDescription || '',
        icpNumber: res.data.icpNumber || '',
        loginBgUrl: res.data.loginBgUrl || '',
        enableRegistration: res.data.enableRegistration ?? false,
        enableCaptcha: res.data.enableCaptcha ?? false,
        defaultUserRole: res.data.defaultUserRole || '',
      })
    }
  }
  catch {
    toast.error(t('systemSettings.loadingSettings'))
  }
  finally {
    loading.value = false
  }
}

async function saveSettings() {
  saving.value = true
  try {
    await $fetch('/api/systems/settings', {
      method: 'PUT',
      body: form.value,
    })
    toast.success(t('systemSettings.settingsSaved'))
  }
  catch (error: any) {
    toast.error(`${t('systemSettings.saveFailed')}: ${error.data?.message || error.message}`)
  }
  finally {
    saving.value = false
  }
}

useSeoMeta({ title: `${t('systemSettings.title')} - ${t('nav.system')}` })

onMounted(loadSettings)
</script>

<template>
  <div class="container max-w-2xl space-y-6">
    <div>
      <h2 class="text-xl font-bold tracking-tight">
        {{ t('systemSettings.title') }}
      </h2>
      <p class="text-sm text-muted-foreground">
        {{ t('systemSettings.description') }}
      </p>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="size-6 animate-spin text-muted-foreground" />
    </div>

    <Card v-else class="gap-0">
      <CardContent class="space-y-4 pt-6">
        <div class="space-y-2">
          <Label for="siteTitle">{{ t('systemSettings.siteTitle') }}</Label>
          <Input id="siteTitle" v-model="form.siteTitle" :placeholder="t('systemSettings.siteTitle')" />
          <p class="text-xs text-muted-foreground">
            {{ t('systemSettings.siteTitleDesc') }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="siteDescription">{{ t('systemSettings.siteDescription') }}</Label>
          <Input id="siteDescription" v-model="form.siteDescription" :placeholder="t('systemSettings.siteDescription')" />
        </div>

        <div class="space-y-2">
          <Label for="siteLogoUrl">{{ t('systemSettings.siteLogo') }} URL</Label>
          <Input id="siteLogoUrl" v-model="form.siteLogoUrl" placeholder="/favicon.ico" />
        </div>

        <div class="space-y-2">
          <Label for="loginBgUrl">{{ t('systemSettings.loginBg') }} URL</Label>
          <Input id="loginBgUrl" v-model="form.loginBgUrl" :placeholder="t('systemSettings.description')" />
        </div>

        <div class="space-y-2">
          <Label for="icpNumber">{{ t('systemSettings.icpNumber') }}</Label>
          <Input id="icpNumber" v-model="form.icpNumber" :placeholder="t('systemSettings.icpNumber')" />
        </div>

        <Separator />

        <div class="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p class="text-sm font-medium">
              {{ t('systemSettings.openRegistration') }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ t('systemSettings.enableRegistration') }}
            </p>
          </div>
          <Switch v-model:checked="form.enableRegistration" />
        </div>

        <div class="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p class="text-sm font-medium">
              {{ t('systemSettings.loginCaptcha') }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ t('systemSettings.enableCaptcha') }}
            </p>
          </div>
          <Switch v-model:checked="form.enableCaptcha" />
        </div>
      </CardContent>
      <CardFooter class="justify-end gap-2 border-t pt-4">
        <Button variant="outline" :disabled="saving" @click="loadSettings">
          {{ t('systemSettings.reset') }}
        </Button>
        <Button :disabled="saving" @click="saveSettings">
          <Save v-if="!saving" class="size-4" />
          <Loader2 v-else class="size-4 animate-spin" />
          {{ t('systemSettings.save') }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
