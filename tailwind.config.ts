import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dbz: {
          orange: '#F85B1A', // زي غوكو
          blue: '#005CAF',   // القميص الداخلي
          yellow: '#FFD600', // سوبر سايان
          energy: '#00F0FF', // كامي هامي ها
          scouter: 'rgba(255, 50, 50, 0.9)', // زجاج الكشاف
          dark: '#050505',
        }
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