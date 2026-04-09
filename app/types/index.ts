/**
 * Tipos compartilhados do Calendário SEAC-PA
 * Desenvolvido por Thiago Maués, 2026
 */

/** Tipo de dia especial */
export type TipoDia = 'feriado' | 'facultativo'

/** Representa um feriado ou ponto facultativo */
export interface Feriado {
  /** Data no formato DD/MM/YYYY */
  data: string
  /** Descrição do feriado/ponto facultativo */
  descricao: string
  /** Classificação: feriado nacional/estadual ou ponto facultativo */
  tipo: TipoDia
}

/** Resultado da verificação do dia atual */
export interface StatusHoje {
  ehFeriado: boolean
  ehFacultativo: boolean
  ehFimDeSemana: boolean
  descricao: string | null
}

/** Feriado com data parseada para uso nos componentes */
export interface FeriadoParsed extends Omit<Feriado, 'data'> {
  /** Data original em string DD/MM/YYYY */
  dataOriginal: string
  /** Date object parseado */
  data: Date
}
