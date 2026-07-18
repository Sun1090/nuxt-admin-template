declare namespace Api {
  namespace Common {
    interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
      data: T[]
      pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
        hasNext: number
        hasPrev: number
      }
      code: number
      msg: string | undefined
    }

    type UserStatus = 'active'
      | 'inactive'
      | 'suspended' | 'all' | undefined
    type Category = 'page' | 'menu' | 'feature' | 'action' | undefined
    // 通用查询参数类型
    interface PaginationQuery {
      page?: string
      pageSize?: string
      search?: string
      [key: string]: any
    }
    /** common params of paginating */
    interface PaginatingCommonParams {
      page?: number
      pageSize?: number
      total: number
      totalPages: number
      hasNext: number
      hasPrev: number
    }
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'pageSize' | 'page'>
  }
}
