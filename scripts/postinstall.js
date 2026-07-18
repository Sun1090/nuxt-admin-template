#!/usr/bin/env node

import fs from 'node:fs'
import process from 'node:process'

// 检查是否在CI环境中
const isCI = process.env.CI || process.env.NETLIFY || process.env.VERCEL

if (isCI) {
  console.log('🔧 CI环境检测到，检查 Drizzle 配置...')

  try {
    // 检查 Drizzle 配置文件是否存在
    if (fs.existsSync('drizzle.config.ts') && fs.existsSync('drizzle/schema.ts')) {
      console.log('✅ Drizzle 配置检查完成')
    }
    else {
      console.warn('⚠️ Drizzle 配置文件不完整')
    }
  }
  catch (error) {
    console.error('❌ Drizzle 配置检查失败:', error.message)
    // 在CI环境中不要因为配置检查失败而中断整个安装过程
  }
}
else {
  console.log('📝 本地开发环境，跳过自动检查')
}
