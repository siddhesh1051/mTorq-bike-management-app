/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ccfbf1',
        'primary-dark': '#99f6e4',
        'primary-foreground': '#115e59',
        background: '#09090b',
        'card-bg': 'rgba(9, 9, 11, 0.7)',
        'border-color': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['System'],
        heading: ['System'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
}
