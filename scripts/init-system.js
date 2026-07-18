#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import postgres from 'postgres'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(currentDir, '../.env') })

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL 环境变量未设置')
  process.exit(1)
}

const sqlFilePath = path.resolve(currentDir, 'sql/init-system.sql')

if (!fs.existsSync(sqlFilePath)) {
  console.error('SQL 文件不存在:', sqlFilePath)
  process.exit(1)
}

const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8')

async function initSystem() {
  console.log('🚀 开始初始化系统数据...')

  const client = postgres(process.env.DATABASE_URL, {
    max: 1,
    ssl: process.env.DATABASE_URL.includes('sslmode=require') ? 'require' : false,
  })

  try {
    // 检查是否已初始化
    const existingRoles = await client`SELECT id FROM "Role" LIMIT 1`
    if (existingRoles.length > 0) {
      console.log('⚠️  系统已初始化过，如需重新初始化请先清空相关表')
      console.log('   提示：可运行 npm run clear-db 清空数据后重试')
      process.exit(0)
    }

    // 执行 SQL
    console.log('📋 执行初始化 SQL...')
    await client.unsafe(sqlContent)

    console.log('✅ 系统数据初始化完成！')
    console.log('   - 已创建角色：超级管理员、系统管理员、普通用户')
    console.log('   - 已创建权限：页面、菜单、操作、功能权限')
    console.log('   - 已分配角色权限')
    console.log('\n下一步：运行 npm run admin:create 创建管理员账户')
  }
  catch (error) {
    console.error('❌ 初始化失败:', error.message)
    process.exit(1)
  }
  finally {
    await client.end()
  }
}

initSystem()
