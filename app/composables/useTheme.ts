export const useTheme = () => {
  const isDark = useState<boolean>('theme-dark', () => false)

  const toggleTheme = () => {
    isDark.value = !isDark.value
    if (import.meta.client) {
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', isDark.value)
    }
  }

  const initTheme = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme')
      if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDark.value = true
        document.documentElement.classList.add('dark')
      }
    }
  }

  return { isDark, toggleTheme, initTheme }
}