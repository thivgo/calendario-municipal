/**
 * Composable: useTheme
 * Wrapper para @nuxtjs/color-mode com interface simplificada.
 * Desenvolvido por Thiago Maués, 2026
 */

export function useTheme() {
  const colorMode = useColorMode()

  const isDark = computed(() => colorMode.value === 'dark')

  function toggleTheme() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }

  return {
    isDark,
    toggleTheme,
  }
}
