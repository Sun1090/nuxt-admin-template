export function useLocalStorage<T>(key: string, defaultValue: T) {
  const value = ref<T>(defaultValue)

  const read = () => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    }
    catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  }

  const write = (value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    }
    catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error)
    }
  }

  onMounted(() => {
    value.value = read()
  })

  watch(
    value,
    (newValue) => {
      write(newValue)
    },
    { deep: true },
  )

  return value
}
