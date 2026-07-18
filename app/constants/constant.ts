export const userStatusRecord: CommonType.IxpType = {
  active: '活跃',
  inactive: '停用',
  suspended: '暂停',
}

export const statusRecord: CommonType.IxpType = {
  active: '启用',
  inactive: '停用',
}

export const resourceRecord: CommonType.IxpType = {
  user: '用户',
  role: '角色',
  permission: '权限',
}

export const actionRecord: CommonType.IxpType = {
  create: '创建',
  read: '查询',
  update: '更新',
  delete: '删除',
}

export const categoryRecord: CommonType.IxpType = {
  page: '页面',
  menu: '菜单',
  action: '操作',
  feature: '功能',
}

// 开放 API 可用权限列表 - 根据实际业务调整
export const apiPermissions = [
  {
    value: 'users:read',
    label: '用户查询',
    description: '查看用户列表和详情',
  },
  {
    value: 'users:write',
    label: '用户管理',
    description: '创建、修改和删除用户',
  },
  {
    value: 'roles:read',
    label: '角色查询',
    description: '查看角色列表和详情',
  },
  {
    value: 'roles:write',
    label: '角色管理',
    description: '创建、修改和删除角色',
  },
  {
    value: 'analytics:read',
    label: '数据分析',
    description: '查看系统分析数据和报表',
  },
]
