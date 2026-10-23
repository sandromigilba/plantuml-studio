import { ref, computed } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

const currentTheme = ref<ThemeMode>('light') // Default light mode
const isDark = ref<boolean>(false)

export function useTheme() {
  const initTheme = () => {
    if (!import.meta.client) return

    const saved = localStorage.getItem('plantuml_studio_theme') as ThemeMode | null
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      currentTheme.value = saved
    } else {
      currentTheme.value = 'light'
    }

    applyTheme()

    // Listen to OS preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (currentTheme.value === 'system') {
          applyTheme()
        }
      })
    }
  }

  const applyTheme = () => {
    if (!import.meta.client) return

    let prefersDark = false
    if (currentTheme.value === 'system') {
      prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      prefersDark = currentTheme.value === 'dark'
    }

    isDark.value = prefersDark

    const root = document.documentElement
    if (prefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const setTheme = (theme: ThemeMode) => {
    currentTheme.value = theme
    if (import.meta.client) {
      localStorage.setItem('plantuml_studio_theme', theme)
    }
    applyTheme()
  }

  const toggleTheme = () => {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return {
    currentTheme,
    isDark: computed(() => isDark.value),
    initTheme,
    setTheme,
    toggleTheme,
  }
}
