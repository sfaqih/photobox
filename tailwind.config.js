/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
module.exports = withMT({
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
          colors: {
            'mint': '#A3D1C6', // custom color
          },
        },
    },
    plugins: [
      require('tailwind-scrollbar')({
        nocompatible: true,
        preferredStrategy: 'pseudoelements',
      }),
    ],
})