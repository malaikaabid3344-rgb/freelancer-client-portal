/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2f1ff',
          100: '#e6e4ff',
          200: '#cfccff',
          300: '#aca5ff',
          400: '#8b7cff',
          500: '#6c4df6',
          600: '#5b34e6', // main indigo/purple accent
          700: '#4a28c2',
          800: '#3d229c',
          900: '#331f7d'
        },
        navy: {
          900: '#0f1229',
          800: '#161a3a',
          700: '#1d2246'
        },
        success: '#16a34a',
        pending: '#f59e0b',
        danger: '#dc2626',
        info: '#2563eb'
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.08)'
      },
      borderRadius: {
        xl2: '1rem'
      }
    }
  },
  plugins: []
};
