export default defineEventHandler(async (event) => {
  // 检查权限，只有超级用户才能执行
  const user = event.context.user
  if (!user || user.roleName !== '超级管理员') {
    throw createError({
      statusCode: 403,
      message: '无权执行系统初始化',
    })
  }

  try {
    await initializeSystem()
    return { success: true, message: '系统初始化成功' }
  }
  catch (error) {
    console.error('系统初始化失败:', error)
    throw createError({
      statusCode: 500,
      message: '系统初始化失败',
    })
  }
})
