<script setup lang="ts">
/**
 * ThemeToggle.vue
 * Botão minimalista para alternar entre dark/light mode.
 * Usa SVGs inline (Lucide-style) ao invés de emojis.
 * Desenvolvido por Thiago Maués, 2026
 */

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    id="theme-toggle-btn"
    aria-label="Alternar entre modo claro e escuro"
    class="theme-toggle"
    @click="toggleTheme"
  >
    <Transition name="icon-swap" mode="out-in">
      <svg
        v-if="isDark"
        key="moon"
        class="theme-toggle__icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg
        v-else
        key="sun"
        class="theme-toggle__icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    </Transition>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 200ms ease, background-color 200ms ease,
    border-color 200ms ease;
}

.theme-toggle:hover {
  color: var(--text-primary);
  background: var(--surface-hover);
  border-color: var(--border);
}

.theme-toggle__icon {
  display: block;
}

/* Swap transition */
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.icon-swap-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.icon-swap-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}
</style>
