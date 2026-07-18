declare namespace Api {
  namespace Permission {
    type ListSearchParams = CommonType.RecordNullable<
      {
        name: string
      } & Common.CommonSearchParams
    >
    interface List {
      id: string
      name: string
      remark: string
      category: string
      resource: null
      action: null
      created_at: string
      updated_at: string
    }

  }
}
