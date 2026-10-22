import type { Config } from 'tailwindcss'

// Star-atlas palette. The stock purple/fuchsia/violet/indigo and gray scales are
// remapped so every existing panel inherits the quiet atlas tones without edits.
const steel = {
  50: '#EEF1F5', 100: '#DCE2EA', 200: '#C2CCDA', 300: '#A9B6C9', 400: '#93A4BC',
  500: '#6F84A1', 600: '#566C8B', 700: '#435875', 800: '#34465F', 900: '#283850', 950: '#1C2A3E',
}
const navy = {
  50: '#F3F0E6', 100: '#E9E3D0', 200: '#D5D3C9', 300: '#B9C0CC', 400: '#93A4BC',
  500: '#7A8CA5', 600: '#56688A', 700: '#3A5274', 800: '#2A3F5E', 900: '#1C3050', 950: '#13233A',
}

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: navy,
        purple: steel,
        fuchsia: steel,
        violet: steel,
        indigo: steel,
        atlas: {
          sky: '#13233A',
          pocket: '#1C3050',
          chalk: '#E9E3D0',
          mist: '#93A4BC',
          grid: '#3A5274',
          brass: '#D4A95A',
        },
      },
      fontFamily: {
        sans: ['"Golos Text"', 'system-ui', 'sans-serif'],
        atlas: ['Alegreya', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
