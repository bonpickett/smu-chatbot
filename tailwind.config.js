/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          'smu-blue': '#354ca1',
          'smu-red': '#CC0035',
        }
      },
    },
    plugins: [],
  }