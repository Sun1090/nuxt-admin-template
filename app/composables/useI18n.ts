/**
 * 国际化 composable
 * 基于 @nuxtjs/i18n (vue-i18n) 的封装
 * 支持中英文切换，类型安全的消息路径
 *
 * 保持与旧版自定义 i18n 相同的 API：
 *   const { t, locale, setLocale } = useI18n()
 *   t('auth.login')              // → "登录"
 *   t('time.minutesAgo', { n: 5 })  // → "5 分钟前"
 */

import { useI18n as useVueI18n } from 'vue-i18n'
import type { LocaleMessages } from '~~/i18n/locales/types'

type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never

type Path<T> = PathImpl<T, keyof T> extends infer P extends string
  ? P
  : never

type MessagePath = Path<LocaleMessages>

const LOCALE_KEY = 'app-locale'

/**
 * 使用国际化
 * @returns t - 翻译函数，支持点号路径，如 t('auth.login')
 * @returns locale - 当前语言
 * @returns setLocale - 切换语言
 */
export function useI18n() {
  const { t: vueT, locale: vueLocale } = useVueI18n({ useScope: 'global' })

  const t = (path: MessagePath, params?: Record<string, string | number>): string => {
    return vueT(path, params || {})
  }

  const locale = computed(() => vueLocale.value)

  const setLocale = (newLocale: string) => {
    vueLocale.value = newLocale
    if (import.meta.client) {
      localStorage.setItem(LOCALE_KEY, newLocale)
      document.documentElement.lang = newLocale
    }
  }

  // 客户端初始化时从 localStorage 恢复语言设置
  if (import.meta.client) {
    const saved = localStorage.getItem(LOCALE_KEY)
    if (saved) {
      vueLocale.value = saved
    }
  }

  return {
    t,
    locale,
    setLocale,
  }
}

export type { LocaleMessages }
export type { MessagePath }