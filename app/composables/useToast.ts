import { toast } from 'vue-sonner'

interface ToastOptions {
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  description?: string
  dismissible?: boolean
}

export function useToast() {
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    options: ToastOptions = {},
  ) => {
    const { duration = 3000, ...restOptions } = options

    const baseOptions = {
      duration,
      ...restOptions,
    }

    switch (type) {
      case 'success':
        return toast.success(message, baseOptions)
      case 'error':
        return toast.error(message, baseOptions)
      case 'info':
        return toast.info(message, baseOptions)
      case 'warning':
        return toast.warning(message, baseOptions)
      default:
        return toast(message, baseOptions)
    }
  }

  const success = (message: string, options?: ToastOptions) =>
    showToast(message, 'success', options)

  const error = (message: string, options?: ToastOptions) =>
    showToast(message, 'error', options)

  const info = (message: string, options?: ToastOptions) =>
    showToast(message, 'info', options)

  const warning = (message: string, options?: ToastOptions) =>
    showToast(message, 'warning', options)

  // 异步操作 toast
  const promise = <T>(
    promise: Promise<T>,
    options: {
      loading?: string
      success?: string | ((data: T) => string)
      error?: string | ((error: any) => string)
    },
  ) => {
    return toast.promise(promise, options)
  }

  // 加载状态
  const loading = (message: string, options?: ToastOptions) => {
    return toast.loading(message, options)
  }

  // 移除 toast
  const dismiss = (toastId?: string | number) => {
    return toast.dismiss(toastId)
  }

  return {
    // 基础方法（保持与原API兼容）
    showToast,
    success,
    error,
    info,
    warning,

    // 高级方法
    promise,
    loading,
    dismiss,

    // 直接访问（用于复杂场景）
    toast,
  }
}
