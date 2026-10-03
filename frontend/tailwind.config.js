/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: "#064C42",
        "forest-dark": "#043730",
        "teal-dark": "#0B6257",
        leaf: "#4CAF50",
        earth: "#9A4E16",
        "earth-light": "#BA6828",
        cream: "#F8F7EF",
        "cream-card": "#FFFFFF",
        mint: "#E6F2E7",
        "soft-blue": "#DDEEFF",
        solar: "#FFF2A8",
        "warm-orange": "#F4A340"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
