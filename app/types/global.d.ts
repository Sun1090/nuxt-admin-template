// 全局类型声明文件

interface Window {
  $showNotification: (message: string, type?: 'success' | 'error' | 'info') => void
}

/**
 * The option type
 *
 * @property value: The option value
 * @property label: The option label
 */
interface Option<K = number | string, M = number | string> { value: K, label: M }

type YesOrNo = 'Y' | 'N'

/** add null to all properties */
type RecordNullable<T> = {
  [K in keyof T]?: T[K] | undefined;
}
interface IxpType {
  [key: string]: any // This is the index signature: "any string key maps to a string value"
}
