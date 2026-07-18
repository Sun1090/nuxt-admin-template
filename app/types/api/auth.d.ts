declare namespace Api {
  namespace Auth {
    interface User {
      id: number
      username: string
      name: string | null
      avatar?: string
      email?: string | null
      phone?: string | null
      roleId?: string
      roleName?: string | null
      roleDesc?: string | null
      permissions?: Permission[]
      permissionNames?: string[]
      needsPasswordChange: boolean
    }
  }
}
