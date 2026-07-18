interface UsePaginationOptions {
  defaultPageSize?: number
}

export function usePagination<T>(options: UsePaginationOptions = {}) {
  const { defaultPageSize = 15 } = options

  const pagination = reactive({
    page: 1,
    pageSize: defaultPageSize,
    total: 0,
    totalPages: 0,
  })

  const loading = ref(false)

  // 更新分页信息
  function updatePagination(response: Api.Common.PaginatingQueryRecord<T>) {
    pagination.total = response.pagination.total
    pagination.totalPages = response.pagination.totalPages
  }

  // 重置分页
  function resetPagination() {
    pagination.page = 1
    pagination.total = 0
    pagination.totalPages = 0
  }

  // 构建查询参数
  function buildQuery(additionalParams: Record<string, any> = {}): Api.Common.PaginationQuery {
    return {
      page: pagination.page.toString(),
      pageSize: pagination.pageSize.toString(),
      ...additionalParams,
    }
  }

  return {
    pagination,
    loading,
    updatePagination,
    resetPagination,
    buildQuery,
  }
}
