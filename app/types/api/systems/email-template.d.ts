declare namespace Api {
  namespace EmailTemplate {
    type ListSearchParams = CommonType.RecordNullable<{
      key: string
      name: string
    } & Common.CommonSearchParams>

    interface List {
      id: number
      key: string
      name: string
      subject: string
      html: string
      createdAt: string
      updatedAt: string
      updatedByUserId?: number | null
    }

    interface AddForm {
      key: string
      name: string
      subject: string
      html: string
    }
  }
}
