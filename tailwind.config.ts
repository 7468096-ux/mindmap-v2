import type { Config } from 'tailwindcss'

// Fluent 2: 8px for surfaces (cards, dialogs, flyouts), 4px for controls
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        '2xl': '8px',
        xl: '8px',
        lg: '6px',
        md: '4px',
      },
      fontFamily: {
        sans: ['"Segoe UI Variable Text"', '"Segoe UI Variable"', '"Segoe UI"', '-apple-system', 'BlinkMacSystemFont', '"Inter Variable"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        fluent4: '0 2px 4px rgba(0,0,0,0.28), 0 0 2px rgba(0,0,0,0.24)',
        fluent16: '0 8px 16px rgba(0,0,0,0.28), 0 0 2px rgba(0,0,0,0.24)',
        fluent64: '0 32px 64px rgba(0,0,0,0.37), 0 0 8px rgba(0,0,0,0.28)',
      },
    },
  },
  plugins: [],
}
export default config
