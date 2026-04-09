<script setup lang="ts">
/**
 * CalendarioAnual.vue
 * Calendário visual do ano 2026 com feriados e pontos facultativos.
 * Grid responsivo: 3 colunas (desktop), 2 (tablet), 1 (mobile).
 * Desenvolvido por Thiago Maués, 2026
 */

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  isWeekend,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { FeriadoParsed } from '~/types'

const props = defineProps<{
  feriados: FeriadoParsed[]
  loading: boolean
  modelValue?: Date
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date): void
}>()

const hoje = new Date()

/** Nomes abreviados dos dias da semana em PT-BR */
const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

/** Gera os 12 meses de 2026 */
const meses = computed(() => {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2026, i, 1)
    return {
      index: i,
      nome: format(date, 'MMMM', { locale: ptBR }),
      nomeAbrev: format(date, 'MMM', { locale: ptBR }),
      date,
    }
  })
})

/**
 * Retorna os dias a renderizar para um dado mês.
 */
function getDiasMes(mesIndex: number) {
  const mesDate = new Date(2026, mesIndex, 1)
  const inicio = startOfMonth(mesDate)
  const fim = endOfMonth(mesDate)
  const inicioGrid = startOfWeek(inicio, { weekStartsOn: 0 })
  const fimGrid = endOfWeek(fim, { weekStartsOn: 0 })
  return eachDayOfInterval({ start: inicioGrid, end: fimGrid })
}

/**
 * Verifica se uma data tem um feriado e retorna o objeto.
 */
function getFeriado(data: Date): FeriadoParsed | undefined {
  return props.feriados.find((f) => isSameDay(f.data, data))
}

function isHoje(data: Date): boolean {
  return isSameDay(data, hoje)
}

const dataReferencia = computed(() => props.modelValue || new Date())

/**
 * Verifica se a data é a selecionada.
 */
function isSelecionada(data: Date): boolean {
  return isSameDay(data, dataReferencia.value)
}

function selecionarDia(data: Date) {
  emit('update:modelValue', data)
}

/* --- Tooltip state --- */
const tooltipVisible = ref(false)
const tooltipText = ref('')
const tooltipX = ref(0)
const tooltipY = ref(0)

function showTooltip(event: MouseEvent, feriado: FeriadoParsed) {
  tooltipText.value = feriado.descricao
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  tooltipX.value = rect.left + rect.width / 2
  tooltipY.value = rect.top - 8
  tooltipVisible.value = true
}

function hideTooltip() {
  tooltipVisible.value = false
}
</script>

<template>
  <section id="calendario-anual" class="cal" aria-label="Calendário anual 2026">
    <div class="cal__header">
      <h2 class="cal__title">Calendário 2026</h2>
      <div class="cal__legend">
        <span class="legend-item">
          <span class="legend-dot legend-dot--feriado"></span>
          Feriado
        </span>
        <span class="legend-item">
          <span class="legend-dot legend-dot--facultativo"></span>
          Facultativo
        </span>
        <span class="legend-item">
          <span class="legend-dot legend-dot--hoje"></span>
          Hoje
        </span>
        <span class="legend-item">
          <span class="legend-dot legend-dot--selecionado"></span>
          Selecionado
        </span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="cal__grid">
      <div v-for="i in 12" :key="i" class="mes-skel">
        <div class="skeleton" style="width: 50%; height: 14px; margin-bottom: 12px"></div>
        <div class="skeleton" style="width: 100%; height: 140px; border-radius: 8px"></div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div v-else class="cal__grid">
      <div
        v-for="mes in meses"
        :key="mes.index"
        class="mes"
      >
        <h3 class="mes__title capitalize">{{ mes.nome }}</h3>

        <!-- Weekday header -->
        <div class="mes__weekdays">
          <span v-for="(dia, di) in diasSemana" :key="di" class="mes__weekday">{{ dia }}</span>
        </div>

        <!-- Days grid -->
        <div class="mes__days">
          <div
            v-for="(dia, idx) in getDiasMes(mes.index)"
            :key="idx"
            class="day"
            :class="{
              'day--outside': !isSameMonth(dia, mes.date),
              'day--feriado': getFeriado(dia)?.tipo === 'feriado' && isSameMonth(dia, mes.date),
              'day--facultativo': getFeriado(dia)?.tipo === 'facultativo' && isSameMonth(dia, mes.date),
              'day--fim-semana': isWeekend(dia) && !getFeriado(dia) && isSameMonth(dia, mes.date),
              'day--hoje': isHoje(dia) && !isSelecionada(dia) && isSameMonth(dia, mes.date),
              'day--selecionado': isSelecionada(dia) && isSameMonth(dia, mes.date),
            }"
            @click="isSameMonth(dia, mes.date) ? selecionarDia(dia) : null"
            @mouseenter="getFeriado(dia) && isSameMonth(dia, mes.date) ? showTooltip($event, getFeriado(dia)!) : null"
            @mouseleave="hideTooltip"
          >
            <span v-if="isSameMonth(dia, mes.date)" class="day__num">{{ format(dia, 'd') }}</span>
            <!-- Indicator dot for holidays -->
            <span
              v-if="getFeriado(dia) && isSameMonth(dia, mes.date)"
              class="day__indicator"
              :class="getFeriado(dia)!.tipo === 'feriado' ? 'day__indicator--feriado' : 'day__indicator--facultativo'"
            ></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tooltip via Teleport -->
    <Teleport to="body">
      <Transition name="tooltip-pop">
        <div
          v-if="tooltipVisible"
          class="tooltip"
          :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
        >
          {{ tooltipText }}
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.cal {
  margin-top: 0;
}

.cal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.cal__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.cal__legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.legend-dot--feriado { background: var(--feriado); }
.legend-dot--facultativo { background: var(--facultativo); }

.legend-dot--hoje {
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--text-tertiary);
}

.legend-dot--selecionado {
  background: transparent;
  box-shadow: 0 0 0 1.5px var(--accent);
}

/* --- Grid --- */
.cal__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 900px) {
  .cal__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 540px) {
  .cal__grid {
    grid-template-columns: 1fr;
  }
}

/* --- Mes Card --- */
.mes {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: var(--shadow-xs);
}

.mes__title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.625rem;
  padding-left: 2px;
}

.mes__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 2px;
}

.mes__weekday {
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  text-align: center;
  padding: 3px 0;
}

.mes__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

/* --- Day Cell --- */
.day {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 120ms ease;
}

.day:not(.day--outside):hover {
  background: var(--surface-hover);
}

.day--outside {
  visibility: hidden;
}

.day__num {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* Holiday indicator dot below number */
.day__indicator {
  position: absolute;
  bottom: 3px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.day__indicator--feriado { background: var(--feriado); }
.day__indicator--facultativo { background: var(--facultativo); }

/* Holiday text styling */
.day--feriado .day__num {
  color: var(--feriado);
  font-weight: 700;
}

.day--facultativo .day__num {
  color: var(--facultativo);
  font-weight: 700;
}

/* Fim de semana */
.day--fim-semana .day__num {
  color: var(--text-tertiary);
}

/* Today pointer */
.day--hoje {
  box-shadow: inset 0 0 0 1px var(--text-tertiary);
  background: transparent;
}

.day--hoje .day__num {
  font-weight: 700;
}

/* Selected day: ring around number */
.day--selecionado {
  background: var(--accent-soft);
}

.day--selecionado .day__num {
  color: var(--accent);
  font-weight: 700;
}

/* --- Skeleton cards --- */
.mes-skel {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: var(--shadow-xs);
}

/* --- Tooltip transition --- */
.tooltip-pop-enter-active,
.tooltip-pop-leave-active {
  transition: opacity 120ms ease, transform 120ms ease;
}

.tooltip-pop-enter-from,
.tooltip-pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}
</style>
