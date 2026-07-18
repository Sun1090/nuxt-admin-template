import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { and, asc, count, desc, eq, gte, or } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// 加载环境变量
const currentDir = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(currentDir, '../../.env') })

// 检查环境变量
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// 创建PostgreSQL连接
const connectionString = process.env.DATABASE_URL

// 检测数据库类型
const isNeonDatabase = connectionString.includes('neon.tech') || connectionString.includes('neon.database.com')

// 根据数据库类型选择配置
function getDatabaseConfig(): any {
  // 配置保持不变...
  if (isNeonDatabase) {
    return {
      max: process.env.NODE_ENV === 'production' ? 3 : 5,
      idle_timeout: 10,
      connect_timeout: 10,
      max_lifetime: 3600,
      ssl: 'require',
      prepare: false,
      transform: { undefined: null },
      connection: { application_name: 'nuxt-admin' },
      onnotice: process.env.NODE_ENV === 'development' ? console.log : undefined,
      debug: process.env.NODE_ENV === 'development' && process.env.DEBUG_SQL === 'true',
    }
  }
  else {
    return {
      max: process.env.NODE_ENV === 'production' ? 10 : 5,
      idle_timeout: 20,
      connect_timeout: 30,
      max_lifetime: 3600,
      ssl: connectionString.includes('sslmode=require') || connectionString.includes('ssl=true') ? 'require' : false,
      prepare: false,
      transform: { undefined: null },
      connection: { application_name: 'nuxt-admin' },
      onnotice: process.env.NODE_ENV === 'development' ? console.log : undefined,
      debug: process.env.NODE_ENV === 'development' && process.env.DEBUG_SQL === 'true',
    }
  }
}

const client = postgres(connectionString, getDatabaseConfig())

// 创建Drizzle数据库实例
export const db = drizzle(client, { schema })

// 导出连接客户端（用于手动查询或关闭连接）
export { client }

// 导出schema以便在其他地方使用
export * from './schema'

// 导出drizzle-orm函数
export { and, asc, count, desc, eq, gte, or }

// 数据库连接测试函数
export async function testConnection() {
  try {
    await client`SELECT 1`
    console.log('✅ Database connection successful')
    return true
  }
  catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// 获取数据库连接状态 
export function getConnectionStatus() {
  // 使用闭包变量跟踪连接状态
  return {
    isConnected: true, // 假设连接正常，实际状态通过测试函数验证
    maxConnections: client.options.max,
    idleTimeout: client.options.idle_timeout,
    connectTimeout: client.options.connect_timeout,
  }
}

// 连接管理 - 简化版本
let idleTimer: NodeJS.Timeout | null = null
const IDLE_TIMEOUT = isNeonDatabase ? 5 * 60 * 1000 : 10 * 60 * 1000

// 重置空闲计时器
function resetIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer)
  }

  // 只在生产环境启用自动断开
  if (process.env.NODE_ENV === 'production') {
    idleTimer = setTimeout(async () => {
      try {
        console.log(`🔄 Auto-closing idle database connections`)
        await client.end({ timeout: isNeonDatabase ? 5 : 10 })
      }
      catch (error) {
        console.error('❌ Error during auto-close:', error)
      }
    }, IDLE_TIMEOUT)
  }
}

// 包装数据库操作以支持自动启停 - 简化版本
export function withAutoReconnect<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    resetIdleTimer()

    try {
      return await operation(...args)
    }
    catch (error: any) {
      // 简化错误处理
      console.error('❌ Database operation failed:', error)
      throw error
    }
  }
}

// 优雅关闭数据库连接
export async function closeConnection() {
  try {
    if (idleTimer) {
      clearTimeout(idleTimer)
      idleTimer = null
    }

    await client.end({ timeout: 10 })
    console.log('✅ Database connection closed gracefully')
  }
  catch (error) {
    console.error('❌ Error closing database connection:', error)
  }
}

// 设置优雅关闭处理
if (typeof process !== 'undefined') {
  const gracefulShutdown = async () => {
    console.log('🔄 Shutting down database connections...')
    await closeConnection()
  }

  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
  process.on('beforeExit', gracefulShutdown)
}
