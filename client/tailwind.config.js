/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}","./node_modules/react-tailwindcss-select/dist/index.esm.js"],
  theme: {
    fontSize: {
      'sm'  : ['0.75rem','0.78rem'],  //12px
      'base': ["1rem","1.1rem"], //14px ['0.875rem','0.9rem']
      "lg"  : ["1rem","1.1rem"],     //16px
      "xl"  : ["1.25rem","1.35rem"], //20px
      "2xl" : ["1.5rem","1.6rem"],   //24px
      "3xl" : ["1.9rem","2rem"],   //32px
      "4xl" : ["2.25rem","2.35rem"],  //36px
      "5xl" : ["2.5rem","2.6rem"],   //40px
    },
    extend: {
      colors: {
        'gray-900': '#252525',
        'gray-800': '#424242',
        'gray-700': '#8C8C8C',
        'gray-600': '#ADADAD',
        'gray-500': '#C7C7C7',
      },
      width:{
        96 : "22rem" // 352px
      },
    },
  },
  plugins: [],
}