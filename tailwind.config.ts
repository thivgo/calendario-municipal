import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{vue,ts,js}',
    './components/**/*.{vue,ts,js}',
    './layouts/**/*.{vue,ts,js}',
    './pages/**/*.{vue,ts,js}',
    './composables/**/*.{vue,ts,js}',
    './plugins/**/*.{vue,ts,js}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        accent: {
          blue: 'var(--color-accent-blue)',
          yellow: 'var(--color-accent-yellow)',
        },
        feriado: 'var(--color-feriado)',
        facultativo: 'var(--color-facultativo)',
        'dia-util': 'var(--color-dia-util)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 500ms ease-out forwards',
        shimmer: 'shimmer 2s infinite linear',
        ping: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
