module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F6F0FA',
          100: '#E8D8F0',
          200: '#D4BCDE',
          300: '#C0A0CC',
          400: '#CDB4DB', // base
          500: '#A890B8',
          600: '#8E7AB5',
          700: '#74608C',
          800: '#5A4663',
          900: '#402C3A',
        },

        icecream: {
          vanilla: '#FFFACD',
          chocolate: '#8B4513',
          strawberry: '#FF6B6B',
          mint: '#98FF98',
          blueberry: '#4169E1',
          lemon: '#FFF44F',
          raspberry: '#E30B5D',
          peach: '#FFE5B4',
        }
      },

      // 🔥 Extra styling (recommended)
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },

      boxShadow: {
        soft: '0 10px 25px rgba(0,0,0,0.1)',
      },

      fontFamily: {
        ice: ['Poppins', 'sans-serif'],
      }
    }
  },
  plugins: [],
}