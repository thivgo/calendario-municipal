/**
 * API Server-side: /api/feriados
 * Faz scraping da página da Agência Pará para extrair feriados e pontos facultativos de 2026.
 * Utiliza cache de 24h com useStorage() do Nitro para evitar requisições excessivas.
 * Desenvolvido por Thiago Maués, 2026
 */

import * as cheerio from 'cheerio'

/** Tipo de dia especial */
type TipoDia = 'feriado' | 'facultativo'

/** Representa um feriado ou ponto facultativo */
interface Feriado {
  data: string
  descricao: string
  tipo: TipoDia
}

const CACHE_KEY = 'feriados:2026'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 horas em ms

const TARGET_URL =
  'https://agenciapara.com.br/noticia/73545/governo-do-para-divulga-datas-de-feriados-e-pontos-facultativos-para-2026'

/**
 * Mapeamento de nomes de meses em português para números (1-indexed)
 */
const MESES: Record<string, string> = {
  janeiro: '01',
  fevereiro: '02',
  março: '03',
  marco: '03',
  abril: '04',
  maio: '05',
  junho: '06',
  julho: '07',
  agosto: '08',
  setembro: '09',
  outubro: '10',
  novembro: '11',
  dezembro: '12',
}

/**
 * Fallback hardcoded de feriados de 2026, caso o scraping falhe.
 * Inclui feriados nacionais, estaduais (Pará) e municipais (Belém).
 */
const FALLBACK_FERIADOS: Feriado[] = [
  { data: '01/01/2026', descricao: 'Confraternização Universal', tipo: 'feriado' },
  { data: '02/01/2026', descricao: 'Ponto facultativo', tipo: 'facultativo' },
  { data: '16/02/2026', descricao: 'Carnaval', tipo: 'facultativo' },
  { data: '17/02/2026', descricao: 'Carnaval', tipo: 'facultativo' },
  { data: '18/02/2026', descricao: 'Quarta-feira de Cinzas (até 12h)', tipo: 'facultativo' },
  { data: '02/04/2026', descricao: 'Ponto facultativo', tipo: 'facultativo' },
  { data: '03/04/2026', descricao: 'Sexta-feira Santa', tipo: 'feriado' },
  { data: '20/04/2026', descricao: 'Ponto facultativo', tipo: 'facultativo' },
  { data: '21/04/2026', descricao: 'Tiradentes', tipo: 'feriado' },
  { data: '01/05/2026', descricao: 'Dia do Trabalho', tipo: 'feriado' },
  { data: '04/06/2026', descricao: 'Corpus Christi', tipo: 'facultativo' },
  { data: '05/06/2026', descricao: 'Ponto facultativo', tipo: 'facultativo' },
  { data: '15/08/2026', descricao: 'Adesão do Grão-Pará à Independência do Brasil', tipo: 'feriado' },
  { data: '07/09/2026', descricao: 'Independência do Brasil', tipo: 'feriado' },
  { data: '12/10/2026', descricao: 'Nossa Senhora Aparecida', tipo: 'feriado' },
  { data: '26/10/2026', descricao: 'Recírio (ponto facultativo até 12h)', tipo: 'facultativo' },
  { data: '28/10/2026', descricao: 'Dia do Servidor Público', tipo: 'facultativo' },
  { data: '02/11/2026', descricao: 'Finados', tipo: 'feriado' },
  { data: '15/11/2026', descricao: 'Proclamação da República', tipo: 'feriado' },
  { data: '20/11/2026', descricao: 'Dia Nacional de Zumbi e da Consciência Negra', tipo: 'feriado' },
  { data: '07/12/2026', descricao: 'Ponto facultativo', tipo: 'facultativo' },
  { data: '08/12/2026', descricao: 'Nossa Senhora da Conceição', tipo: 'facultativo' },
  { data: '24/12/2026', descricao: 'Véspera de Natal', tipo: 'facultativo' },
  { data: '25/12/2026', descricao: 'Natal', tipo: 'feriado' },
  { data: '31/12/2026', descricao: 'Véspera de Ano Novo', tipo: 'facultativo' },
]

/**
 * Parseia o dia de uma string como "1º de janeiro" ou "2 de janeiro"
 */
function parseDia(texto: string): string {
  const match = texto.match(/(\d{1,2})[ºª°]?\s/)
  if (match) {
    return (match[1] || '').padStart(2, '0')
  }
  return '01'
}

/**
 * Determina se o texto indica um ponto facultativo ou feriado.
 * Prioriza "feriado" quando o texto contém "feriado nacional/estadual" antes de "ponto facultativo".
 */
function classificarTipo(texto: string): 'feriado' | 'facultativo' {
  const lower = texto.toLowerCase()

  // Se contém explicitamente "feriado nacional" ou "feriado estadual", é feriado
  if (lower.includes('feriado nacional') || lower.includes('feriado estadual')) {
    return 'feriado'
  }

  if (
    lower.includes('ponto facultativo') ||
    lower.includes('facultativo') ||
    (lower.includes('carnaval') && !lower.includes('feriado')) ||
    lower.includes('corpus christi')
  ) {
    return 'facultativo'
  }
  return 'feriado'
}

/**
 * Limpa a descrição removendo redundâncias como "feriado nacional", "ponto facultativo"
 * e extrai apenas o nome do feriado.
 */
function limparDescricao(desc: string): string {
  // Remove classificações redundantes do final
  let limpo = desc
    .replace(/,?\s*(feriado nacional|feriado estadual|feriado municipal|ponto facultativo|feriado)\s*$/i, '')
    .replace(/,?\s*(feriado nacional|feriado estadual|feriado municipal|ponto facultativo|feriado)\s*;/i, ';')
    .trim()

  // Se depois da limpeza ficou só com "ponto facultativo" ou similar, manter
  if (!limpo || limpo.length < 3) {
    limpo = desc
  }

  // Remove ponto e vírgula e texto de segunda entrada na mesma linha
  const semicolonIdx = limpo.indexOf(';')
  if (semicolonIdx !== -1) {
    limpo = limpo.substring(0, semicolonIdx).trim()
  }

  // Capitalizar primeira letra
  return limpo.charAt(0).toUpperCase() + limpo.slice(1)
}

/**
 * Tenta extrair feriados do HTML da página da Agência Pará.
 * A página lista os feriados em formato de texto, após "Confira as datas:".
 * Cada entrada segue o padrão: "Xº de mês, descrição, tipo;"
 */
function extrairFeriados(html: string): Feriado[] {
  const $ = cheerio.load(html)
  const feriados: Feriado[] = []

  // Pega o texto inteiro do body
  const bodyText = $('body').text()

  // Encontra a seção da lista de feriados (após "Confira as datas:")
  const marcador = bodyText.indexOf('Confira as datas:')
  if (marcador === -1) {
    console.warn('[SEAC-PA] Não encontrou marcador "Confira as datas:" no HTML')
    return []
  }

  // Pega texto após o marcador. O fim da lista é geralmente antes de uma seção como "SAÚDE"
  const textoApos = bodyText.substring(marcador + 'Confira as datas:'.length)
  // Limitar até encontrar um bloco que não faz parte da lista (ex: seção de notícias)
  const fimLista = textoApos.search(/\n\s*(SAÚDE|mais notícias|Texto:|Serviço:)/i)
  const textoLista = fimLista !== -1 ? textoApos.substring(0, fimLista) : textoApos.substring(0, 3000)

  const lines = textoLista
    .split('\n')
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 0)

  let mesAtual = ''
  const ANO = '2026'

  for (const line of lines) {
    const lineLower = line.toLowerCase().trim()

    // Pular linhas muito longas — são parágrafos, não entradas de feriados
    if (line.length > 200) continue

    // Verifica se a linha é apenas um nome de mês (header)
    const mesesNomes = Object.keys(MESES)
    const ehMes = mesesNomes.some((m) => lineLower === m)
    if (ehMes) {
      mesAtual = MESES[lineLower] || ''
      continue
    }

    // Tenta extrair data no formato "Xº de mês" ou "X de mês"
    const matchData = line.match(/^(\d{1,2})[ºª°]?\s+de\s+(\w+)/i)
    if (!matchData) continue

    const dia = (matchData[1] || '').padStart(2, '0')
    const mesNome = (matchData[2] || '').toLowerCase()
    const mesNum = MESES[mesNome] || mesAtual
    if (!mesNum) continue

    mesAtual = mesNum

    const dataStr = `${dia}/${mesNum}/${ANO}`

    // Identificar se há um "segundo" bloco na mesma linha e dividir
    const restoGeral = line.substring(matchData[0].length)
    const matchSegundo = restoGeral.match(/(\d{1,2})[ºª°]?\s+de\s+(\w+)/i)

    let textoItem1 = restoGeral
    if (matchSegundo && matchSegundo.index !== undefined) {
      textoItem1 = restoGeral.substring(0, matchSegundo.index)
    }

    // Processar o PRIMEIRO feriado
    const tipo1 = classificarTipo(textoItem1)
    
    let desc1 = textoItem1.replace(/^[\s,;-]+/, '').replace(/[;.]$/g, '').trim()
    if (!desc1) desc1 = 'Ponto facultativo'
    desc1 = limparDescricao(desc1)

    // Evitar duplicatas
    if (!feriados.some((f) => f.data === dataStr)) {
      feriados.push({ data: dataStr, descricao: desc1, tipo: tipo1 })
    }

    // Processar o SEGUNDO feriado (se houver)
    if (matchSegundo) {
      const dia2 = (matchSegundo[1] || '').padStart(2, '0')
      const mesNome2 = (matchSegundo[2] || '').toLowerCase()
      const mesNum2 = MESES[mesNome2] || mesAtual
      const dataStr2 = `${dia2}/${mesNum2}/${ANO}`

      const textoItem2 = restoGeral.substring(matchSegundo.index!)
      const tipo2 = classificarTipo(textoItem2)

      let desc2 = textoItem2
        .substring(matchSegundo[0].length)
        .replace(/^[\s,;-]+/, '')
        .replace(/[;.]$/g, '')
        .trim()
      
      if (!desc2) desc2 = 'Ponto facultativo'
      desc2 = limparDescricao(desc2)

      if (!feriados.some((f) => f.data === dataStr2)) {
        feriados.push({ data: dataStr2, descricao: desc2, tipo: tipo2 })
      }
    }
  }

  return feriados
}

export default defineEventHandler(async (event) => {
  // Tenta buscar do cache primeiro
  const storage = useStorage('cache')

  interface CachedData {
    data: Feriado[]
    timestamp: number
  }

  const cached = await storage.getItem<CachedData>(CACHE_KEY)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  // Tenta fazer scraping
  let feriados: Feriado[] = []

  try {
    console.log('[SEAC-PA] Fazendo scraping da Agência Pará...')
    const html = await $fetch<string>(TARGET_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
    })

    feriados = extrairFeriados(html)

    if (feriados.length < 5) {
      // Se extraiu poucos feriados, provavelmente falhou
      console.warn(
        `[SEAC-PA] Scraping retornou apenas ${feriados.length} itens. Usando fallback.`
      )
      feriados = FALLBACK_FERIADOS
    } else {
      console.log(`[SEAC-PA] Scraping bem-sucedido: ${feriados.length} feriados encontrados.`)
    }
  } catch (error) {
    console.error('[SEAC-PA] Erro no scraping, usando fallback:', error)
    feriados = FALLBACK_FERIADOS
  }

  // Salva no cache
  await storage.setItem(CACHE_KEY, {
    data: feriados,
    timestamp: Date.now(),
  })

  return feriados
})
