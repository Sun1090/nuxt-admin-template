/**
 * Transform record to option
 *
 * @example
 *   ```ts
 *   const record = {
 *     key1: 'label1',
 *     key2: 'label2'
 *   };
 *   const options = transformRecordToOption(record);
 *   // [
 *   //   { value: 'key1', label: 'label1' },
 *   //   { value: 'key2', label: 'label2' }
 *   // ]
 *   ```;
 *
 * @param record
 */
export function transformRecordToOption<T extends Record<string, string>>(record: T) {
  return Object.entries(record).map(([value, label]) => ({
    value,
    label,
  })) as CommonType.Option<keyof T, T[keyof T]>[]
}

// utils/permission.ts
/**
 * 解析权限名称
 */
export function parsePermissionName(name: string): { category: Api.Common.Category, resource: string, action: string | undefined } {
  if (!name || typeof name !== 'string') {
    return { category: undefined, resource: '', action: undefined }
  }

  const [category, rest] = name.split(':')

  if (!category || !rest) {
    return { category: name as Api.Common.Category, resource: '', action: undefined }
  }

  // 检查是否是 action 类型（包含点号）
  if (rest.includes('.')) {
    const [resource, action] = rest.split('.')
    return {
      category: category.trim() as Api.Common.Category,
      resource: resource?.trim() || '',
      action: action?.trim() || '',
    }
  }
  else {
    // 非 action 类型
    return {
      category: category.trim() as Api.Common.Category,
      resource: rest.trim(),
      action: undefined,
    }
  }
}

/**
 * 生成权限名称
 */
export function generatePermissionName(category: string, resource?: string, action?: string): string {
  const cleanCategory = category?.trim()
  const cleanResource = resource?.trim()
  const cleanAction = action?.trim()

  if (!cleanCategory) {
    return ''
  }

  if (cleanCategory === 'action' && cleanResource && cleanAction) {
    return `${cleanCategory}:${cleanResource}.${cleanAction}`
  }
  else if (cleanResource) {
    return `${cleanCategory}:${cleanResource}`
  }
  else {
    return cleanCategory
  }
}

export function getStatusVariant(status: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    inactive: 'destructive',
    suspended: 'outline',
  }
  return variants[status] || 'secondary'
}

export function formatDate(date: string | Date) {
  if (!date)
    return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}
