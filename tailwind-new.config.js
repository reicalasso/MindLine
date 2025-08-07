/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        'cat': ['Indie Flower', 'Comic Sans MS', 'cursive'],
        'elegant': ['Montserrat', 'sans-serif'],
        'handwriting': ['Dancing Script', 'cursive'],
        'romantic': ['Caveat', 'Dancing Script', 'cursive'],
      },
      colors: {
        // Kedi teması ana renkleri
        cat: {
          50: '#feeeeeff',
          100: '#fdd1d1ff',
          200: '#fba2a2ff',
          300: '#f86868ff',
          400: '#f53333ff',
          500: '#f21c1cff',
          600: '#e31212ff',
          700: '#bc1111ff',
          800: '#971616ff',
          900: '#7a1515ff',
        },
        // Pembe tonları
        paw: {
          50: '#fef2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // Romantik renkler
        romantic: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Gri tonları
        fur: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Sihirli renkler
        magic: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        }
      },
      backgroundImage: {
        'cat-gradient': 'linear-gradient(135deg, #fef7ee 0%, #fde8d1 30%, #fbd2a2 70%, #f8b668 100%)',
        'paw-gradient': 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)',
        'love-gradient': 'linear-gradient(135deg, #ec4899 0%, #f472b6 30%, #f9a8d4 70%, #fce7f3 100%)',
        'fur-gradient': 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)',
        'magic-gradient': 'linear-gradient(135deg, #a855f7 0%, #c084fc 50%, #e9d5ff 100%)',
        'romantic-gradient': 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 30%, #fecaca 70%, #fca5a5 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #fef7ee 0%, #fde8d1 25%, #fbd2a2 50%, #f8b668 75%, #f59133 100%)',
        'pink-gradient': 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 25%, #fbcfe8 50%, #f9a8d4 75%, #f472b6 100%)',
      },
      boxShadow: {
        'cat': '0 4px 25px rgba(242, 113, 28, 0.2), 0 2px 10px rgba(242, 113, 28, 0.1)',
        'paw': '0 4px 25px rgba(236, 72, 153, 0.2), 0 2px 10px rgba(236, 72, 153, 0.1)',
        'romantic': '0 4px 25px rgba(239, 68, 68, 0.2), 0 2px 10px rgba(239, 68, 68, 0.1)',
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08), 0 1px 6px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 30px rgba(242, 113, 28, 0.4), 0 0 60px rgba(242, 113, 28, 0.2)',
        'magic': '0 4px 25px rgba(168, 85, 247, 0.2), 0 2px 10px rgba(168, 85, 247, 0.1)',
        'love-glow': '0 0 25px rgba(236, 72, 153, 0.4), 0 0 50px rgba(236, 72, 153, 0.2)',
      },
      animation: {
        'bounce-cat': 'bounce-cat 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'purr': 'purr 2s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'bounce-love': 'bounce-love 1.5s ease-in-out infinite',
        'gradient-shift': 'gradientShift 15s ease infinite',
        'particle-float': 'particleFloat 8s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'emoji-zoom': 'emojiZoom 0.5s ease-in-out',
      },
      keyframes: {
        'bounce-cat': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(-5deg)' },
          '50%': { transform: 'translateY(-20px) rotate(0deg)' },
          '75%': { transform: 'translateY(-10px) rotate(5deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg) scale(1)' },
          '25%': { transform: 'rotate(5deg) scale(1.05)' },
          '50%': { transform: 'rotate(-3deg) scale(0.95)' },
          '75%': { transform: 'rotate(3deg) scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-15px) rotate(2deg)' },
          '66%': { transform: 'translateY(-5px) rotate(-1deg)' },
        },
        purr: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.03) rotate(1deg)' },
          '50%': { transform: 'scale(1.06) rotate(0deg)' },
          '75%': { transform: 'scale(1.02) rotate(-1deg)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1.05)' },
          '75%': { transform: 'scale(1.15)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'bounce-love': {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0) scale(1)' },
          '40%, 43%': { transform: 'translateY(-15px) scale(1.1)' },
          '70%': { transform: 'translateY(-8px) scale(1.05)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        particleFloat: {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.3' },
          '90%': { opacity: '0.3' },
          '100%': { transform: 'translateY(-100px) rotate(360deg)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 4px rgba(242, 113, 28, 0.3)' },
          '50%': { boxShadow: '0 0 0 8px rgba(242, 113, 28, 0.1)' },
        },
        emojiZoom: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.5) rotate(10deg)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      screens: {
        'xs': '475px',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
