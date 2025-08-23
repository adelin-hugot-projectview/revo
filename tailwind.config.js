/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2B5F4C',
        secondary: '#E1F2EC',
        accent: '#FFBB33',
        neutralDark: '#222222',
        neutralLight: '#F8F9FA',
        danger: '#E74C3C',
        success: '#2ECC71',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};