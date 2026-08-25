/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f172a",     // Slate 900
        secondary: "#e2e8f0",   // Slate 200
        accent: "#2563eb",      // Blue 600
        base: "#f8fafc",        // Slate 50
        dark: "#1F2937",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
