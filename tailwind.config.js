/** @type {import('tailwindcss').Config} */
export default {
  content: ['./*.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          red: '#E33439',
          black: '#373435',
        },
        'natural-black': '#212121',
        secondary: { green: '#147257', blue: '#065381' },
        'dark-grey': '#727376',
        'light-grey': '#96989A',
        'light-green': '#D9F2CB',
        'neutral-white': '#FEFEFE',
        'light-red': '#F1999C',
        'grey-white': '#F3F3F3',
        'medium-grey': '#FAFAFA',
        'disabled-grey': '#EFEFEF',
        'lighter-grey': '#D9D9D9',
        'lighter-red': '#FDECE8',
        stroke: '#D9D9D9',
      },
    },
    boxShadow: {
      primary: '0px 0px 3px 0px',
      secondary: '0px 2px 10px rgba(0, 0, 0, 0.06)',
      modal: '0px 8px 11px -4px #0000000D',
      calendar: '0px 4px 14px 0px #0000001A',
      search: '0px 0px 3px 0px rgba(190, 190, 190, 0.79)',
    },
  },
  plugins: [],
};
