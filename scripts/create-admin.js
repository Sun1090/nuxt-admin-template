#!/usr/bin/env node

import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcrypt'
import { config } from 'dotenv'
import { eq } from 'drizzle-orm'
import { db, notificationSettings, permissions, roles, users } from '../app/drizzle/db.ts'

// ES模块中获取当前目录
const currentDir = path.dirname(fileURLToPath(import.meta.url))

// 加载环境变量
config({ path: path.resolve(currentDir, '../.env') })

// 检查环境变量
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL 环境变量未设置')
  process.exit(1)
}

async function main() {
  try {
    console.log('🚀 开始创建超级管理员用户...')

    // 1. 检查是否已有超级管理员角色
    const superAdminRole = await db.select()
      .from(roles)
      .where(eq(roles.name, '超级管理员'))
      .limit(1)

    console.log('🔍 查询角色结果:', superAdminRole)

    if (superAdminRole.length === 0) {
      console.error('❌ 超级管理员角色不存在，请先运行数据库初始化脚本')
      process.exit(1)
    }

    const roleId = superAdminRole[0].id
    console.log('🎯 使用角色ID:', roleId)

    // 2. 检查是否已有超级管理员用户
    const existingSuperAdmin = await db.select()
      .from(users)
      .where(eq(users.username, 'admin')) // 改为通过用户名检查
      .limit(1)

    console.log('🔍 检查现有管理员:', existingSuperAdmin)

    if (existingSuperAdmin.length > 0) {
      console.log('✅ 超级管理员用户已存在，跳过创建')
      return existingSuperAdmin[0]
    }

    // 3. 加密密码
    const hashedPassword = await bcrypt.hash('admin123', 12)
    console.log(hashedPassword) // $2b$12$rKhTK8OKTnFr.auhKgDz8uWAH0JWKlXugR0ff7uzev4KuxoDEogWi
    // 4. 创建超级管理员用户
    console.log('📝 创建新管理员用户...')

    const userData = {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@service.com',
      phone: '13800000000',
      role_id: roleId,
      forcePasswordChange: false,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const [admin] = await db.insert(users).values(userData).returning()

    console.log('✅ 超级管理员用户创建成功:', admin.id)

    // 5. 为管理员创建通知设置
    try {
      await db.insert(notificationSettings).values({
        userId: admin.id,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log('✅ 通知设置创建成功')
    }
    catch (error) {
      console.log('⚠️ 通知设置创建失败:', error.message)
    }

    // 6. 显示登录信息
    console.log('\n🎉 管理员账户创建完成！')
    console.log('================================')
    console.log('用户名: admin')
    console.log('密码: admin123')
    console.log('角色: 超级管理员')
    console.log('================================')
    console.log('\n⚠️ 请立即登录系统并修改默认密码！')

    return admin
  }
  catch (error) {
    console.error('❌ 创建管理员用户失败:', error)
    throw error
  }
}

// 主执行函数
async function run() {
  try {
    console.log('🔍 检查系统初始化状态...')

    // 检查系统是否已初始化
    const rolesCount = await db.select().from(roles)
    const permissionsCount = await db.select().from(permissions)

    console.log(`📊 系统检查 - 角色数量: ${rolesCount.length}, 权限数量: ${permissionsCount.length}`)

    if (rolesCount.length === 0 || permissionsCount.length === 0) {
      console.error('❌ 系统未初始化，请先运行数据库初始化脚本')
      process.exit(1)
    }

    console.log('✅ 系统已初始化，开始创建管理员...')
    await main()
    console.log('🎊 管理员初始化完成！')
    process.exit(0)
  }
  catch (error) {
    console.error('❌ 管理员初始化失败:', error)
    process.exit(1)
  }
}

run()
