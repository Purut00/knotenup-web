/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ini warna dari Navbar awak tadi
        primary: '#6c63ff',      // Purple
        secondary: '#ff8c42',    // Orange
        accent: '#e67e22',       // Orange pekat sikit
        dark: '#155724',         // Hijau logo
        glass: 'rgba(255, 255, 255, 0.85)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Cadangan font modern
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}