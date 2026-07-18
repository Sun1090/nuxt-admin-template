// server/utils/init-system.ts
import { db, permissions, rolePermissions, roles } from '../../app/drizzle/db'

export async function initializeSystem() {
  console.log('开始初始化系统数据...')

  try {
    // 检查是否已经初始化
    const existingRoles = await db.select().from(roles).limit(1)
    if (existingRoles.length > 0) {
      console.log('系统已经初始化过，跳过初始化')
      return
    }

    // 1. 插入权限
    console.log('插入权限数据...')
    const permissionData = [
      // 这里放上面所有的权限数据
    ]

    await db.insert(permissions).values(permissionData)
    const allPermissions = await db.select().from(permissions)

    // 2. 插入角色
    console.log('插入角色数据...')
    const roleData = [
      { name: '超级管理员', desc: '系统最高权限管理员，拥有所有权限' },
      { name: '系统管理员', desc: '系统管理员，拥有大部分管理权限' },
      { name: '部门经理', desc: '部门管理人员，拥有部门相关权限' },
      { name: 'HR专员', desc: '人力资源专员，负责员工信息管理' },
      { name: '财务专员', desc: '财务管理人员，负责薪资合同管理' },
      { name: '员工', desc: '普通员工，基础权限' },
    ]

    await db.insert(roles).values(roleData)
    const allRoles = await db.select().from(roles)

    // 3. 分配权限
    console.log('分配角色权限...')

    // 超级管理员 - 所有权限
    const superAdmin = allRoles.find(r => r.name === '超级管理员')!
    await db.insert(rolePermissions).values(
      allPermissions.map(p => ({
        roleId: superAdmin.id,
        permissionId: p.id,
      })),
    )

    // 其他角色权限分配...
    // ... 这里实现其他角色的权限分配逻辑

    console.log('系统初始化完成！')
  }
  catch (error) {
    console.error('系统初始化失败:', error)
    throw error
  }
}

// 在应用启动时调用
// 或者在管理后台提供初始化按钮
