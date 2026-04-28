/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#131313',
        beige: '#d8c8ab',
        gold: '#c5a46d',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luxe: '0 20px 50px -20px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
