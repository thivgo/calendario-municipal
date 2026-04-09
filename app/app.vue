<script setup lang="ts">
/**
 * app.vue — Layout raiz do Calendário SEAC-PA
 * Header profissional com SVG logo, ThemeToggle integrado, e NuxtPage.
 * Desenvolvido por Thiago Maués, 2026
 */
</script>

<template>
  <div class="app-root">
    <!-- Header -->
    <header class="header" id="app-header">
      <div class="header__inner">
        <div class="header__brand">
          <h1 class="header__logo">
            <!-- SVG Calendar icon -->
            <svg
              class="header__logo-icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span class="header__logo-text">Calendário do Pará</span>
          </h1>
          <p class="header__subtitle">Feriados e Pontos Facultativos · 2026</p>
        </div>

        <div class="header__actions">
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main id="main">
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
}

/* === Header === */
.header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--header-bg);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  border-bottom: 1px solid var(--border-subtle);
}

.header__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__brand {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.header__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 0.04em;
}

.header__logo-icon {
  color: var(--accent);
  flex-shrink: 0;
}

.header__subtitle {
  font-size: 0.72rem;
  color: var(--text-tertiary);
  font-weight: 400;
  letter-spacing: 0.01em;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
