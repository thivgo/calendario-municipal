# 📅 Calendário do estado do pará — Feriados e Pontos Facultativos 2026

Dashboard visual para consulta dos feriados e pontos facultativos do Governo do Estado do Pará para o ano de 2026.

## ✨ Funcionalidades

- 🔍 **Scraping automático** — Extrai datas diretamente da página da Agência Pará
- 📊 **Dashboard de hoje** — Card em destaque mostrando se hoje é feriado, ponto facultativo ou dia útil
- 📋 **Próximos eventos** — Lista dos próximos feriados com contagem regressiva
- 📅 **Calendário anual** — Visão completa de 2026 com dias marcados e tooltips
- 🌙 **Dark/Light mode** — Alternância suave de tema com persistência
- 📱 **Responsivo** — Funciona em desktop, tablet e mobile
- ♿ **Acessível** — ARIA labels, contraste WCAG AA, foco visível

## 🛠 Stack

- **Nuxt.js 3** + **Vue 3** (Composition API)
- **Tailwind CSS** + CSS Custom Properties
- **Cheerio** (scraping server-side)
- **date-fns** (manipulação de datas)
- **@nuxtjs/color-mode** (dark/light mode)
- **Pinia** (gerenciamento de estado)
- **Google Fonts** (Inter)

## 📦 Instalação

```bash
npm install
```

## 🚀 Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🏗 Build

```bash
npm run build
npm run preview
```

## 📁 Estrutura do Projeto

```
├── app/
│   ├── app.vue                   # Layout raiz
│   ├── pages/index.vue           # Dashboard principal
│   ├── components/
│   │   ├── CalendarioAnual.vue   # Calendário visual 2026
│   │   ├── ProximosEventos.vue   # Lista de próximos feriados
│   │   └── ThemeToggle.vue       # Botão dark/light mode
│   └── composables/
│       ├── useFeriados.ts        # Lógica de feriados
│       └── useTheme.ts           # Lógica de tema
├── server/
│   └── api/feriados.get.ts       # API com scraping + fallback
├── assets/css/main.css           # Design tokens e estilos globais
├── types/index.ts                # Tipos TypeScript
├── nuxt.config.ts                # Config Nuxt
├── tailwind.config.ts            # Config Tailwind
└── package.json
```

## 👤 Autor

Desenvolvido por **Thiago Maués** · 2026

## 📄 Licença

Este projeto é para estudo de scraping automático.
