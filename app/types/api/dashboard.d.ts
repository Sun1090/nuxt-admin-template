declare namespace Api {
  namespace Dashboard {
    interface Stats {
      totalUsers: number
      activeUsers: number
      totalRoles: number
      totalPermissions: number
      totalApiKeys: number
      totalApiLogs: number
      recentUsers: Array<{
        id: number
        username: string
        name: string | null
        status: string
        created_at: string
      }>
      apiActivity: Array<{
        date: string
        count: number
      }>
    }
  }
}
