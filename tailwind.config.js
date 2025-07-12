/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Activation du mode dark basé sur la classe
  theme: {
    extend: {
      colors: {
        // Vous pouvez personnaliser vos couleurs ici
      },
    },
  },
  plugins: [],
}
