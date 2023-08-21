/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        wtm_purple: '#481d52',
        wtm_purple_darker: '#1b0a1f',
        wtm_pink: '#dd517e',
        wtm_pink_darker: '#aa3e60',
        wtm_orange: '#e58e35',
        wtm_orange_darker: '#b26e29',
        wtm_blue: '#556cc9',
        wtm_light_blue: '#7a98ee',
        wtm_light_blue_darker: '#5f77bb',
        wtm_bright_orange: '#fb5134',
        wtm_bright_purple: '#bb4169',
      },
    },
  },
  plugins: [],
};
