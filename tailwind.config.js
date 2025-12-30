/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        // Nature Theme Palette
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a', // Base Primary (Green)
          700: '#15803d', // Forest Green
          800: '#166534',
          900: '#14532d', // Dark Forest
          950: '#052e16',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1', // Light Slate
          400: '#94a3b8',
          500: '#64748b', // Base Secondary (Slate)
          600: '#475569',
          700: '#334155',
          800: '#1e293b', // Dark Slate
          900: '#0f172a', // Very Dark (Background)
          950: '#020617',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316', // Orange
          600: '#ea580c', // Darker Orange
          DEFAULT: '#f97316',
        },
        // Semantic aliases
        forest: '#14532d', // green-900
        earth: '#475569', // slate-600
        sand: '#f5f5f4', // stone-100
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-move': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'text-gradient': 'gradient-move 4s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}