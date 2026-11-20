/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        inzovate: {
          midnight: '#0A1128',
          navy: '#101F42',
          blue: '#0066FF',
          sky: '#0EA5E9',
          bg: '#F5F7FB',
          card: '#FFFFFF',
          text: '#172033',
          muted: '#64748B',
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
