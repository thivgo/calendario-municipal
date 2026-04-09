// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
  ],

  app: {
    head: {
      title: 'Calendário SEAC-PA — Feriados e Pontos Facultativos 2026',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Calendário oficial de feriados e pontos facultativos do Governo do Estado do Pará para 2026. Verifique se hoje é feriado, ponto facultativo ou dia útil.',
        },
        { name: 'author', content: 'Thiago Maués' },
      ],
      htmlAttrs: { lang: 'pt-BR' },
    },
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  googleFonts: {
    families: {
      'Plus+Jakarta+Sans': [500, 600, 700, 800],
      Inter: [400, 500, 600, 700],
    },
    display: 'swap',
  },

  tailwindcss: {},

  nitro: {
    storage: {
      cache: {
        driver: 'memory',
      },
    },
  },
})
