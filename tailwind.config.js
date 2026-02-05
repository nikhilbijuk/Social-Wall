/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#E5DDD5', // WhatsApp-like Light Gray Background
        surface: '#FFFFFF', // White Surface
        primary: '#00A884', // WhatsApp Teal Green
        secondary: '#34B7F1', // Light Blue
        accent: '#25D366', // Green Accent
        card: '#FFFFFF',
        border: '#E2E8F0',
        white: '#FFFFFF',
        dark: '#111B21',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Inter', 'sans-serif'], // Simple clean heading
        mono: ['JetBrains Mono', 'monospace'],
        hand: ['"Architects Daughter"', 'cursive'],
      },
      fontSize: {
        '2xs': '0.625rem',
        'display': ['clamp(3rem, 10vw, 8rem)', { lineHeight: '0.85', letterSpacing: '-0.04em' }],
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'soft': '0 2px 5px rgba(0,0,0,0.05)',
        'chat': '0 1px 0.5px rgba(0,0,0,0.13)',
      },
    },
  },
  plugins: [],
}
