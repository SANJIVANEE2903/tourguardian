/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          400: '#3aa0ff',
          500: '#1a7ee0',
          600: '#0f63b8',
          700: '#0d4f92'
        },
        danger: {
          500: '#e0263f',
          600: '#b81d33'
        }
      }
    }
  },
  plugins: []
};
