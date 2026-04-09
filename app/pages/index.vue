<script setup lang="ts">
/**
 * index.vue — Página principal do Calendário SEAC-PA
 * Dashboard com hero status, próximos eventos e calendário anual.
 * Desenvolvido por Thiago Maués, 2026
 */

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const {
  feriadosParsed,
  loading,
  error,
  verificarHoje,
  proximosEventos,
  formatarData,
  formatarDiaSemana,
  fetchFeriados,
} = useFeriados()

const dataSelecionada = ref(new Date())

/** Status da data selecionada (reativo, atualiza quando feriados carregam ou data muda) */
const statusHoje = computed(() => verificarHoje(dataSelecionada.value))

/** Próximos 5 eventos */
const proximos = computed(() => proximosEventos(5))

/** Dia do mês em destaque */
const diaNumero = computed(() => format(dataSelecionada.value, 'd'))

/** Mês atual */
const mesAtual = computed(() => format(dataSelecionada.value, 'MMMM', { locale: ptBR }))

/** Data completa formatada */
const dataCompleta = computed(() => {
  const diaSemana = format(dataSelecionada.value, 'EEEE', { locale: ptBR })
  const dataFormatada = format(dataSelecionada.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  return `${diaSemana}, ${dataFormatada}`
})

/** Label do tipo de dia */
const labelStatus = computed(() => {
  if (statusHoje.value.ehFeriado) return 'Feriado'
  if (statusHoje.value.ehFacultativo) return 'Ponto Facultativo'
  if (statusHoje.value.ehFimDeSemana) return 'Fim de Semana'
  return 'Dia Útil'
})

/** Tipo para CSS class */
const tipoStatus = computed(() => {
  if (statusHoje.value.ehFeriado) return 'feriado'
  if (statusHoje.value.ehFacultativo) return 'facultativo'
  if (statusHoje.value.ehFimDeSemana) return 'fim-semana'
  return 'util'
})
</script>

<template>
  <div class="page">
    <!-- ===== HERO — STATUS DE HOJE ===== -->
    <section id="status-hoje" aria-label="Status do dia atual" role="status">
      <!-- Skeleton -->
      <div v-if="loading" class="hero hero--loading">
        <div class="hero__left">
          <div class="skeleton" style="width: 48px; height: 16px; margin-bottom: 12px"></div>
          <div class="skeleton" style="width: 120px; height: 80px; margin-bottom: 8px"></div>
          <div class="skeleton" style="width: 80px; height: 20px"></div>
        </div>
        <div class="hero__right">
          <div class="skeleton" style="width: 220px; height: 16px; margin-bottom: 8px"></div>
          <div class="skeleton" style="width: 180px; height: 14px"></div>
        </div>
      </div>

      <!-- Real content -->
      <div
        v-else
        class="hero animate-enter"
        :class="`hero--${tipoStatus}`"
        :style="{ opacity: 0 }"
      >
        <div class="hero__left">
          <span class="hero__badge" :class="`hero__badge--${tipoStatus}`">
            {{ labelStatus }}
          </span>
          <div class="hero__day">{{ diaNumero }}</div>
          <div class="hero__month capitalize">{{ mesAtual }}</div>
        </div>

        <div class="hero__right">
          <p class="hero__date capitalize">{{ dataCompleta }}</p>
          <p v-if="statusHoje.descricao" class="hero__description">
            {{ statusHoje.descricao }}
          </p>
          <p v-else-if="statusHoje.ehFimDeSemana" class="hero__description hero__description--muted">
            Fim de semana. Aproveite o descanso!
          </p>
          <p v-else class="hero__description hero__description--muted">
            Este é um dia normal de trabalho.
          </p>
        </div>

        <!-- Decorative element -->
        <div class="hero__decoration" aria-hidden="true">
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
            <circle cx="90" cy="90" r="88" stroke="currentColor" stroke-width="0.5" opacity="0.07" />
            <circle cx="90" cy="90" r="60" stroke="currentColor" stroke-width="0.5" opacity="0.05" />
            <circle cx="90" cy="90" r="32" stroke="currentColor" stroke-width="0.5" opacity="0.03" />
          </svg>
        </div>
      </div>
    </section>

    <!-- ===== Erro ===== -->
    <div v-if="error" class="error-banner" role="alert">
      <div class="error-banner__content">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{{ error }}</span>
      </div>
      <button class="error-banner__retry" @click="fetchFeriados">
        Tentar novamente
      </button>
    </div>

    <!-- ===== CONTEÚDO: Eventos + Calendário ===== -->
    <div class="content-grid">
      <!-- Próximos Eventos -->
      <aside class="content-grid__sidebar">
        <ProximosEventos
          :eventos="proximos"
          :loading="loading"
          :formatar-data="formatarData"
          :formatar-dia-semana="formatarDiaSemana"
        />
      </aside>

      <!-- Calendário Anual -->
      <div class="content-grid__main">
        <CalendarioAnual
          v-model="dataSelecionada"
          :feriados="feriadosParsed"
          :loading="loading"
        />
      </div>
    </div>

    <!-- ===== Footer ===== -->
    <footer class="footer">
      <p class="footer__text">
        Desenvolvido por <strong>Thiago Maués</strong> · 2026
      </p>
      <p class="footer__sub">
        Dados extraídos da Agência Pará · Governo do Estado do Pará
      </p>
    </footer>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 2rem;
}

/* === Hero Status Card === */
.hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 2.5rem;
  background: var(--surface);
  border-radius: var(--radius-xl);
  padding: 2.5rem 3rem;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: 2rem;
}

.hero--loading {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  background: var(--surface);
  border-radius: var(--radius-xl);
  padding: 2.5rem 3rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
}

/* Tipo-specific accent bar (left, subtle) */
.hero::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.hero--feriado::before { background: var(--feriado); }
.hero--facultativo::before { background: var(--facultativo); }
.hero--util::before { background: var(--accent); }
.hero--fim-semana::before { background: var(--text-tertiary); }

.hero__left {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.hero__badge {
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 10px;
  border-radius: 100px;
  margin-bottom: 6px;
}

.hero__badge--feriado {
  background: var(--feriado-soft);
  color: var(--feriado-text);
}

.hero__badge--facultativo {
  background: var(--facultativo-soft);
  color: var(--facultativo-text);
}

.hero__badge--util {
  background: var(--accent-soft);
  color: var(--accent-text);
}

.hero__badge--fim-semana {
  background: var(--surface-hover);
  color: var(--text-secondary);
}

.hero__day {
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
  font-size: clamp(4rem, 8vw, 6.5rem);
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.hero__month {
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 2px;
}

.hero__right {
  flex: 1;
  min-width: 0;
}

.hero__date {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.hero__description {
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.hero__description--muted {
  color: var(--text-tertiary);
  font-weight: 400;
}

.hero__decoration {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-primary);
  pointer-events: none;
}

/* === Error === */
.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: var(--feriado-soft);
  border: 1px solid hsl(0, 50%, 80%);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  color: var(--feriado-text);
}

.error-banner__content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-banner__retry {
  background: var(--feriado);
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 150ms ease;
}

.error-banner__retry:hover {
  opacity: 0.9;
}

/* === Content Grid === */
.content-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.content-grid__sidebar {
  position: sticky;
  top: 5rem;
  align-self: start;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .content-grid__sidebar {
    position: static;
  }
}

@media (max-width: 640px) {
  .page {
    padding: 1.25rem 1rem;
  }

  .hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 1.75rem 1.5rem;
  }

  .hero__decoration {
    display: none;
  }
}

/* === Footer === */
.footer {
  margin-top: 3rem;
  padding: 1.5rem 0 2rem;
  text-align: center;
  border-top: 1px solid var(--border-subtle);
}

.footer__text {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.footer__text strong {
  color: var(--text-secondary);
  font-weight: 600;
}

.footer__sub {
  font-size: 0.72rem;
  color: var(--text-tertiary);
  margin-top: 3px;
  opacity: 0.7;
}
</style>
