/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#1e1b4b',
        }
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-in':    'slideIn 0.3s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'pulse-glow':  'pulseGlow 3s ease-in-out infinite',
        'float':       'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0', transform: 'translateY(12px)' },   '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn:   { '0%': { opacity: '0', transform: 'translateX(-12px)' },  '100%': { opacity: '1', transform: 'translateX(0)' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(20px)' },   '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%, 100%': { opacity: '0.25' }, '50%': { opacity: '0.6' } },
        float:     { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(99,102,241,0.25)',
        'glow':    '0 0 24px rgba(99,102,241,0.35)',
        'glow-lg': '0 0 48px rgba(99,102,241,0.4)',
        'card':    '0 4px 24px rgba(0,0,0,0.5)',
        'card-lg': '0 8px 40px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
