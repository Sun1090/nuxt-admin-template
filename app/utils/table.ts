export function formatSearchParams(params: Record<string, unknown>) {
  const formattedParams: Record<string, unknown> = {}
  const urlParams: Record<string, unknown> = { ...params }
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formattedParams[key] = value
      urlParams[key] = value
      if (Array.isArray(formattedParams[key])) {
        if (formattedParams[key].length !== 0) {
          formattedParams[key] = formattedParams[key].join(',')
        }
        else {
          delete formattedParams[key]
        }
      }
    }
  })
  return { formattedParams, urlParams }
}
