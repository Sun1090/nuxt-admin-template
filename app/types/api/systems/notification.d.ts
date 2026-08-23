declare namespace Api {
  namespace Notification {
    type ListSearchParams = CommonType.RecordNullable<{
      type: string
      read: string
    } & Common.CommonSearchParams>

    interface Item {
      id: string
      type: string
      message: string
      read: boolean
      userId: number
      createdAt: string
      updatedAt: string
    }
  }

  namespace NotificationSettings {
    interface Item {
      id: string
      userId: number
      enabled: boolean
      createdAt: string
      updatedAt: string
    }
  }
}
