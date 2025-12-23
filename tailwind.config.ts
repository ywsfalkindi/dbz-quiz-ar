import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dbz: {
          orange: '#F85B1A',
          blue: '#005CAF',
          yellow: '#FFD600',
          energy: '#00F0FF',
          scouter: 'rgba(255, 50, 50, 0.9)',
          dark: '#050505',
        }
      },
      // إضافة نصوص ذكية (Fluid Typography)
      fontSize: {
        'fluid-h1': 'clamp(2.5rem, 8vw, 4.5rem)', // للعنوان الرئيسي
        'fluid-h2': 'clamp(1.5rem, 5vw, 3rem)',   // للعناوين الفرعية
        'fluid-p': 'clamp(1rem, 3vw, 1.25rem)',   // للنصوص العادية
      },
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 60s linear infinite',
      },
      keyframes: {
        float: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '100% 100%' },
        }
      }
    },
  },
  plugins: [],
}
export default config