/** The common type namespace */
declare namespace CommonType {
  /**
   * The option type
   *
   * @property value: The option value
   * @property label: The option label
   */
  interface Option<K = number | string, M = number | string> { value: K, label: M }

  type YesOrNo = 'Y' | 'N'

  /** add null to all properties */
  type RecordNullable<T> = {
    [K in keyof T]?: T[K] | undefined;
  }
  interface IxpType {
    [key: string]: any // This is the index signature: "any string key maps to a string value"
  }
  // 定义组件 Props
  interface OptionItem {
    label: string
    value: any
    disabled?: boolean
    [key: string]: any
  }
}
