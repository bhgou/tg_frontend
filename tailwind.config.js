/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'csgo-blue': '#1a365d',
        'csgo-dark': '#0f172a',
        'csgo-orange': '#f97316',
        'csgo-yellow': '#eab308',
        'rarity-common': '#b0c3d9',
        'rarity-uncommon': '#5e98d9',
        'rarity-rare': '#4b69ff',
        'rarity-mythical': '#8847ff',
        'rarity-legendary': '#d32ce6',
        'rarity-ancient': '#eb4b4b',
        'rarity-immortal': '#e4ae39',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}