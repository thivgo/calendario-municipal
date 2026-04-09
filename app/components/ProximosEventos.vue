<script setup lang="ts">
/**
 * ProximosEventos.vue
 * Timeline vertical dos próximos feriados e pontos facultativos.
 * Design com linha de conexão e dots indicadores.
 * Desenvolvido por Thiago Maués, 2026
 */

import type { FeriadoParsed } from '~/types'

interface EventoComDias extends FeriadoParsed {
  diasRestantes: number
}

defineProps<{
  eventos: EventoComDias[]
  loading: boolean
  formatarData: (data: Date) => string
  formatarDiaSemana: (data: Date) => string
}>()

/**
 * Formata o texto da contagem regressiva
 */
function formatDias(dias: number): string {
  if (dias === 0) return 'Hoje'
  if (dias === 1) return 'Amanhã'
  return `${dias}d`
}
</script>

<template>
  <section
    id="proximos-eventos"
    class="eventos"
    aria-label="Próximos feriados e pontos facultativos"
  >
    <div class="eventos__header">
      <h2 class="eventos__title">Próximos</h2>
      <span class="eventos__count" v-if="!loading && eventos.length">{{ eventos.length }}</span>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="eventos__skeleton">
      <div v-for="i in 5" :key="i" class="skel-item">
        <div class="skel-item__dot">
          <div class="skeleton" style="width: 10px; height: 10px; border-radius: 50%"></div>
        </div>
        <div class="skel-item__content">
          <div class="skeleton" style="width: 70%; height: 13px; margin-bottom: 6px"></div>
          <div class="skeleton" style="width: 50%; height: 11px"></div>
        </div>
      </div>
    </div>

    <!-- Timeline -->
    <div v-else-if="eventos.length > 0" class="timeline">
      <div
        v-for="(evento, index) in eventos"
        :key="evento.dataOriginal"
        class="timeline__item animate-enter"
        :class="[
          `stagger-${index + 1}`,
          { 'timeline__item--first': index === 0 }
        ]"
        :style="{ opacity: 0 }"
        role="article"
        :aria-label="`${evento.descricao}, ${formatarData(evento.data)}, ${formatDias(evento.diasRestantes)}`"
      >
        <!-- Dot -->
        <div class="timeline__dot-col">
          <span
            class="timeline__dot"
            :class="evento.tipo === 'feriado' ? 'timeline__dot--feriado' : 'timeline__dot--facultativo'"
          ></span>
          <span v-if="index < eventos.length - 1" class="timeline__line"></span>
        </div>

        <!-- Content -->
        <div class="timeline__content">
          <div class="timeline__top-row">
            <h3 class="timeline__name">{{ evento.descricao }}</h3>
            <span
              class="timeline__countdown tabular-nums"
              :class="evento.tipo === 'feriado' ? 'timeline__countdown--feriado' : 'timeline__countdown--facultativo'"
            >
              {{ formatDias(evento.diasRestantes) }}
            </span>
          </div>
          <p class="timeline__meta">
            {{ formatarData(evento.data) }} · <span class="capitalize">{{ formatarDiaSemana(evento.data) }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="eventos__empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-tertiary)">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <p>Nenhum feriado próximo.</p>
    </div>
  </section>
</template>

<style scoped>
.eventos {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.eventos__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.eventos__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.eventos__count {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-tertiary);
  background: var(--surface-hover);
  padding: 2px 8px;
  border-radius: 100px;
  font-variant-numeric: tabular-nums;
}

/* --- Skeleton --- */
.eventos__skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skel-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.skel-item__dot {
  padding-top: 3px;
}

.skel-item__content {
  flex: 1;
}

/* --- Timeline --- */
.timeline {
  display: flex;
  flex-direction: column;
}

.timeline__item {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding-bottom: 1rem;
}

.timeline__item:last-child {
  padding-bottom: 0;
}

.timeline__dot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12px;
  flex-shrink: 0;
  padding-top: 5px;
}

.timeline__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.timeline__dot--feriado {
  background: var(--feriado);
  box-shadow: 0 0 0 3px var(--feriado-soft);
}

.timeline__dot--facultativo {
  background: var(--facultativo);
  box-shadow: 0 0 0 3px var(--facultativo-soft);
}

.timeline__line {
  flex: 1;
  width: 1px;
  background: var(--border);
  margin-top: 6px;
}

.timeline__content {
  flex: 1;
  min-width: 0;
}

.timeline__top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.timeline__name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.timeline__countdown {
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 100px;
}

.timeline__countdown--feriado {
  color: var(--feriado-text);
  background: var(--feriado-soft);
}

.timeline__countdown--facultativo {
  color: var(--facultativo-text);
  background: var(--facultativo-soft);
}

.timeline__meta {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 2px;
}

/* --- Empty --- */
.eventos__empty {
  text-align: center;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.eventos__empty p {
  font-size: 0.82rem;
  color: var(--text-tertiary);
}
</style>
