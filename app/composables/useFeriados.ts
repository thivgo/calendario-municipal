/**
 * Composable: useFeriados
 * Consome o endpoint /api/feriados e expõe dados reativos sobre feriados.
 * Desenvolvido por Thiago Maués, 2026
 */

import { parse, format, isSameDay, isAfter, differenceInDays, isWeekend } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Feriado, FeriadoParsed, StatusHoje } from '~/types'

/**
 * Converte data DD/MM/YYYY em Date object
 */
function parseDataBR(dataStr: string): Date {
  return parse(dataStr, 'dd/MM/yyyy', new Date())
}

export function useFeriados() {
  const feriados = ref<Feriado[]>([])
  const feriadosParsed = ref<FeriadoParsed[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  /**
   * Busca os feriados da API
   */
  async function fetchFeriados() {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<Feriado[]>('/api/feriados')
      feriados.value = data

      // Parsear datas para objetos Date
      feriadosParsed.value = data
        .map((f) => ({
          ...f,
          dataOriginal: f.data,
          data: parseDataBR(f.data),
        }))
        .sort((a, b) => a.data.getTime() - b.data.getTime())
    } catch (e) {
      error.value = 'Erro ao carregar feriados. Tente novamente.'
      console.error('[useFeriados] Erro:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Verifica se a data especificada é feriado, ponto facultativo ou dia útil
   */
  function verificarHoje(targetDate: Date = new Date()): StatusHoje {
    const feriadoHoje = feriadosParsed.value.find((f) =>
      isSameDay(f.data, targetDate)
    )

    if (feriadoHoje) {
      return {
        ehFeriado: feriadoHoje.tipo === 'feriado',
        ehFacultativo: feriadoHoje.tipo === 'facultativo',
        ehFimDeSemana: isWeekend(targetDate),
        descricao: feriadoHoje.descricao,
      }
    }

    return {
      ehFeriado: false,
      ehFacultativo: false,
      ehFimDeSemana: isWeekend(targetDate),
      descricao: null,
    }
  }

  /**
   * Retorna os próximos N feriados/facultativos a partir de hoje
   */
  function proximosEventos(quantidade: number = 5): (FeriadoParsed & { diasRestantes: number })[] {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    return feriadosParsed.value
      .filter((f) => isAfter(f.data, hoje) || isSameDay(f.data, hoje))
      .slice(0, quantidade)
      .map((f) => ({
        ...f,
        diasRestantes: differenceInDays(f.data, hoje),
      }))
  }

  /**
   * Formata uma data para exibição
   */
  function formatarData(data: Date): string {
    return format(data, "dd 'de' MMMM", { locale: ptBR })
  }

  /**
   * Formata dia da semana
   */
  function formatarDiaSemana(data: Date): string {
    return format(data, 'EEEE', { locale: ptBR })
  }

  /**
   * Verifica se uma data específica tem feriado
   */
  function getFeriadoPorData(data: Date): FeriadoParsed | undefined {
    return feriadosParsed.value.find((f) => isSameDay(f.data, data))
  }

  // Fetch ao montar
  onMounted(() => {
    fetchFeriados()
  })

  return {
    feriados,
    feriadosParsed,
    loading,
    error,
    fetchFeriados,
    verificarHoje,
    proximosEventos,
    formatarData,
    formatarDiaSemana,
    getFeriadoPorData,
  }
}
