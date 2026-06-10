/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yeka: {
          blue: {
            DEFAULT: 'var(--yeka-blue)',
            hover: 'var(--yeka-blue-hover)',
            light: 'var(--yeka-blue-light)',
          },
          text: {
            primary: 'var(--text-primary)',
            secondary: 'var(--text-secondary)',
          },
          border: 'var(--yeka-border)',
        },
        slate: {
          350: '#cbd5e1',
          550: '#64748b',
          650: '#475569',
          750: '#263244',
          850: '#172033',
        },
        indigo: {
          550: '#4f6df5',
          650: '#3451dd',
        },
      },
      spacing: {
        3.5: '0.875rem',
        4.5: '1.125rem',
      },
      boxShadow: {
        'yeka-soft': '0 18px 50px -28px rgba(0, 0, 0, 0.7)',
        'yeka-glow': '0 0 28px -8px rgba(41, 151, 255, 0.42)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
