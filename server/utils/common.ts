/**
 * 解析权限名称
 * 支持两种格式: "category:resource" 和 "action:resource.action"
 */
export function parsePermissionName(name: string): { category: string, resource: string, action: string | null } {
  if (!name || typeof name !== 'string') {
    throw new Error('权限名称不能为空')
  }

  const [category, rest] = name.split(':')

  if (!category || !rest) {
    throw new Error('无效的权限名称格式')
  }

  // 检查是否是 action 类型（包含点号）
  if (rest.includes('.')) {
    const [resource, action] = rest.split('.')
    return {
      category: category.trim(),
      resource: resource?.trim() || '',
      action: action?.trim() || '',
    }
  }
  else {
    // 非 action 类型
    return {
      category: category.trim(),
      resource: rest.trim(),
      action: null,
    }
  }
}
