declare namespace Api {
  namespace SystemSettings {
    interface Item {
      id: number
      siteTitle?: string | null
      siteLogoUrl?: string | null
      siteDescription?: string | null
      icpNumber?: string | null
      loginBgUrl?: string | null
      enableRegistration: boolean
      enableCaptcha: boolean
      defaultUserRole?: string | null
      createdAt: string
      updatedAt: string
    }
  }
}
