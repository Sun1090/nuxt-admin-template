declare namespace Api {
  namespace ApiLog {
    type ListSearchParams = CommonType.RecordNullable<{
      endpoint: string
      method: string
      statusCode: string
    } & Common.CommonSearchParams>

    interface List {
      id: string
      apiKeyId?: string | null
      endpoint: string
      method: string
      statusCode: number
      responseTimeMs: number
      ipAddress: string
      createdAt: string
      errorMessage?: string | null
      apiKeyName?: string | null
    }
  }
}
