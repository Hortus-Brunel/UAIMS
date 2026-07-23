/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4fa',
          100: '#dde6f4',
          200: '#c0d2eb',
          300: '#94b4dd',
          400: '#638fcb',
          500: '#4170b6',
          600: '#30599a',
          700: '#1b3a6b',
          800: '#1e3458',
          900: '#1b2943',
          950: '#0d1a30',
        },
        accent: {
          light: '#38bdf8',
          DEFAULT: '#0284c7',
          dark: '#0369a1',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px -2px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'sidebar': '4px 0 24px -4px rgb(0 0 0 / 0.08)',
      },
      animation: {
        'fade-in':     'fadeIn 0.25s ease-out forwards',
        'slide-up':    'slideUp 0.35s ease-out forwards',
        'pulse-subtle':'pulseSubtle 2s ease-in-out infinite',
        'spin-slow':   'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' },                                        to: { opacity: '1' } },
        slideUp:      { from: { opacity: '0', transform: 'translateY(12px)' },         to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSubtle:  { '0%,100%': { opacity: '1' },                                   '50%': { opacity: '0.8' } },
      },
    },
  },
  plugins: [],
};
