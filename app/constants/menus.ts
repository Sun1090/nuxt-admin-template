import type { NavMenu } from '~/types/nav'

export const fullMenuConfig: NavMenu[] = [
  {
    heading: '仪表盘',
    items: [
      {
        title: '数据概览',
        icon: 'i-lucide-home',
        link: '/dashboard',
        requiredPermission: 'menu:dashboard',
      },
    ],
  },
  {
    heading: '系统管理',
    items: [
      {
        title: '用户管理',
        icon: 'i-lucide-user-cog',
        link: '/systems/users',
        requiredPermission: 'menu:user_mgmt',
      },
      {
        title: '角色管理',
        icon: 'i-lucide-shield',
        link: '/systems/roles',
        requiredPermission: 'menu:role_mgmt',
      },
      {
        title: '权限管理',
        icon: 'i-lucide-key',
        link: '/systems/permissions',
        requiredPermission: 'menu:permission_mgmt',
      },
      {
        title: 'API密钥',
        icon: 'i-lucide-key-round',
        link: '/systems/api-keys',
        requiredPermission: 'menu:api_keys',
      },
      {
        title: '设置',
        icon: 'i-lucide-settings',
        constant: true,
        children: [
          {
            title: '个人中心',
            icon: 'i-lucide-circle',
            link: '/settings/profile',
          },
          {
            title: '用户',
            icon: 'i-lucide-circle',
            link: '/settings/account',
          },
          {
            title: '外观',
            icon: 'i-lucide-circle',
            link: '/settings/appearance',
          },
        ],
      },
    ],
  },
]
