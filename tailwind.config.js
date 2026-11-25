/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#4472C4',
        'brand-dark': '#2F5496',
        'brand-light': '#EBF0FA',
        'brand-muted': '#D6E4F7',
      },
    },
  },
  plugins: [],
}
