declare namespace Api {
  namespace UserStatusLog {
    type ListSearchParams = CommonType.RecordNullable<{
      username: string
    } & Common.CommonSearchParams>

    interface List {
      id: number
      userId: number
      oldStatus?: string | null
      newStatus: string
      reason?: string | null
      createdAt: string
      username?: string | null
      operatorName?: string | null
    }
  }
}
