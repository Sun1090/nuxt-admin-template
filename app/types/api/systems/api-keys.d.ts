declare namespace Api {
  namespace ApiKeys {
    type ListSearchParams = CommonType.RecordNullable<
      {
        name: string
        status: string
      } & Common.CommonSearchParams
    >

    interface List {
      id: string
      name: string
      remark?: string
      apiKey?: string
      keyPrefix: string
      isActive: boolean
      isExpired: boolean
      status: 'active' | 'inactive' | 'expired'
      creatorName?: string
      createdAt: string
      expiresAt?: string
      lastUsedAt?: string
      usageCount: number
      permissions: string[]

    }
  }
}
