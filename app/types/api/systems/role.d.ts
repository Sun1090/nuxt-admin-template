declare namespace Api {
  namespace Role {
    type ListSearchParams = CommonType.RecordNullable<
      {
        name: string
      } & Common.CommonSearchParams
    >
    interface List {
      id: string
      name: string
      remark: string
      created_at: string
      updated_at: string
      is_superadmin: boolean
    }
  }
}
