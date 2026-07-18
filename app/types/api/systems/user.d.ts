declare namespace Api {
  namespace User {
    type ListSearchParams = CommonType.RecordNullable<
      {
        status: string
        username: string
        role: string
      } & Common.CommonSearchParams
    >
    interface List {
      id: number
      username: string
      name?: string | null
      role_id?: string
      role_name?: string
      email?: string | null
      phone?: string | null
      avatar?: string | null
      status: Common.UserStatus
      last_login?: string
      lastLoginIp?: string
      forcePasswordChange: boolean
      passwordChangedAt?: string
      created_at: string
      updated_at: string
      password: string
    }
    type AddForm = CommonType.RecordNullable<List>
  }
}
