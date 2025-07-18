/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'futuristic': ['Montserrat', 'Roboto', 'Arial', 'sans-serif'],
        'cat': ['Indie Flower', 'cursive'],
      },
      colors: {
        futuristic: {
          50: '#f6f8fa',
          100: '#eaecef',
          200: '#d0d7de',
          300: '#afb8c1',
          400: '#8c959f',
          500: '#6e7781',
          600: '#57606a',
          700: '#424a53',
          800: '#32383e',
          900: '#24292f',
        },
        accent: {
          50: '#fdf6e3',
          100: '#f5e6c8',
          200: '#eed9b6',
          300: '#e6cfa3',
          400: '#d9b87a',
          500: '#cfa94d',
          600: '#b38e3a',
          700: '#8c6c2c',
          800: '#6c5221',
          900: '#4d3a16',
        },
        cat: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      backgroundImage: {
        'futuristic-gradient': 'linear-gradient(135deg, #f6f8fa 0%, #eaecef 100%)',
        'cat-gradient': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(100, 116, 139, 0.08)',
      },
    },
  },
  plugins: [],
}
