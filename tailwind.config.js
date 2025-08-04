/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'cat': ['Indie Flower', 'Comic Sans MS', 'cursive'],
        'elegant': ['Montserrat', 'sans-serif'],
        'handwriting': ['Dancing Script', 'cursive'],
        'romantic': ['Caveat', 'Dancing Script', 'cursive'],
      },
      colors: {
        // Kedi teması ana renkleri - daha canlı
        cat: {
          50: '#feeeeeff',   // Çok açık krem
          100: '#fdd1d1ff',  // Krem
          200: '#fba2a2ff',  // Açık turuncu
          300: '#f86868ff',  // Turuncu
          400: '#f53333ff',  // Canlı turuncu
          500: '#f21c1cff',  // Ana turuncu
          600: '#e31212ff',  // Koyu turuncu
          700: '#bc1111ff',  // Çok koyu turuncu
          800: '#971616ff',  // Kahverengi
          900: '#7a1515ff',  // Koyu kahverengi
        },
        // Pembe tonları - daha canlı
        paw: {
          50: '#fef2f8',   // Çok açık pembe
          100: '#fce7f3',  // Açık pembe
          200: '#fbcfe8',  // Pembe
          300: '#f9a8d4',  // Orta pembe
          400: '#f472b6',  // Canlı pembe
          500: '#ec4899',  // Ana pembe
          600: '#db2777',  // Koyu pembe
          700: '#be185d',  // Çok koyu pembe
          800: '#9d174d',  // Mor-pembe
          900: '#831843',  // Koyu mor-pembe
        },
        // Romantik renkler - daha yoğun
        romantic: {
          50: '#fef2f2',   // Çok açık kırmızı
          100: '#fee2e2',  // Açık kırmızı
          200: '#fecaca',  // Kırmızı-pembe
          300: '#fca5a5',  // Orta kırmızı
          400: '#f87171',  // Canlı kırmızı
          500: '#ef4444',  // Ana kırmızı
          600: '#dc2626',  // Koyu kırmızı
          700: '#b91c1c',  // Çok koyu kırmızı
          800: '#991b1b',  // Bordo
          900: '#7f1d1d',  // Koyu bordo
        },
        // Gri tonları (kedi kürkü)
        fur: {
          50: '#f9fafb',   // Beyaz
          100: '#f3f4f6',  // Açık gri
          200: '#e5e7eb',  // Gri
          300: '#d1d5db',  // Orta gri
          400: '#9ca3af',  // Koyu gri
          500: '#6b7280',  // Ana gri
          600: '#4b5563',  // Çok koyu gri
          700: '#374151',  // Antrasit
          800: '#1f2937',  // Koyu antrasit
          900: '#111827',  // Siyah
        },
        // Yeni magic renkler
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
        },
        // Cyberpunk renkler - güçlendirilmiş
        cyber: {
          50: '#0a0a0a',
          100: '#1a1a1a',
          200: '#2a2a2a',
          300: '#3a3a3a',
          400: '#4a4a4a',
          500: '#5a5a5a',
          600: '#6a6a6a',
          700: '#7a7a7a',
          800: '#8a8a8a',
          900: '#9a9a9a',
          primary: '#00ffff',
          secondary: '#ff0040',
          accent: '#b000ff',
          neon: '#00ff00',
          glow: '#ff00ff',
          matrix: '#001122',
          red: '#ff003c',
          purple: '#8000ff',
          blue: '#0080ff',
          green: '#00ff41'
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
        'cyberpunk-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 25%, #0a1a1a 50%, #1a0a0a 75%, #0a0a0a 100%)',
        'cyber-red': 'linear-gradient(135deg, #ff0040 0%, #b000ff 50%, #0a0a0a 100%)',
        'cyber-blue': 'linear-gradient(135deg, #00ffff 0%, #b000ff 50%, #0a0a0a 100%)',
        'cyber-purple': 'linear-gradient(135deg, #b000ff 0%, #ff0040 50%, #00ffff 100%)',
        'cyber-matrix': 'linear-gradient(135deg, #001122 0%, #0a0a0a 25%, #1a0033 50%, #0a0a0a 75%, #001122 100%)',
        'cyber-neon': 'linear-gradient(135deg, #00ffff 0%, #ff0040 25%, #b000ff 50%, #00ff41 75%, #00ffff 100%)',
      },
      boxShadow: {
        'cat': '0 4px 25px rgba(242, 113, 28, 0.2), 0 2px 10px rgba(242, 113, 28, 0.1)',
        'paw': '0 4px 25px rgba(236, 72, 153, 0.2), 0 2px 10px rgba(236, 72, 153, 0.1)',
        'romantic': '0 4px 25px rgba(239, 68, 68, 0.2), 0 2px 10px rgba(239, 68, 68, 0.1)',
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08), 0 1px 6px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 30px rgba(242, 113, 28, 0.4), 0 0 60px rgba(242, 113, 28, 0.2)',
        'magic': '0 4px 25px rgba(168, 85, 247, 0.2), 0 2px 10px rgba(168, 85, 247, 0.1)',
        'love-glow': '0 0 25px rgba(236, 72, 153, 0.4), 0 0 50px rgba(236, 72, 153, 0.2)',
        'cyber': '0 0 20px rgba(255, 0, 64, 0.5), 0 0 40px rgba(176, 0, 255, 0.3), 0 0 60px rgba(0, 255, 255, 0.2)',
        'cyber-intense': '0 0 30px rgba(255, 0, 64, 0.8), 0 0 60px rgba(176, 0, 255, 0.6), 0 0 90px rgba(0, 255, 255, 0.4)',
        'neon-red': '0 0 10px #ff0040, 0 0 20px #ff0040, 0 0 30px #ff0040, 0 0 40px #ff0040',
        'neon-blue': '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff',
        'neon-purple': '0 0 10px #b000ff, 0 0 20px #b000ff, 0 0 30px #b000ff, 0 0 40px #b000ff',
        'neon-green': '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41, 0 0 40px #00ff41',
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
        'cyber-glow': 'cyberGlow 3s ease-in-out infinite',
        'glitch': 'glitch 0.8s infinite',
        'neon-flicker': 'neonFlicker 2s infinite',
        'data-stream': 'dataStream 25s linear infinite',
        'matrix-rain': 'matrixRain 15s linear infinite',
        'hologram': 'hologram 4s ease-in-out infinite',
        'circuit-pulse': 'circuitPulse 3s ease-in-out infinite',
        'cyber-glow-lite': 'cyberGlowLite 4s ease-in-out infinite',
        'neon-flicker-lite': 'neonFlickerLite 3s infinite',
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
        cyberGlow: {
          '0%, 100%': {
            boxShadow: '0 0 3px #ff0040, 0 0 6px #ff0040',
            textShadow: '0 0 3px #ff0040'
          },
          '50%': {
            boxShadow: '0 0 6px #00ffff, 0 0 12px #00ffff',
            textShadow: '0 0 6px #00ffff'
          },
        },
        cyberGlowLite: {
          '0%, 100%': {
            textShadow: '0 0 3px currentColor'
          },
          '50%': {
            textShadow: '0 0 6px currentColor'
          },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '25%': { transform: 'translate(-1px, 1px)' },
          '50%': { transform: 'translate(1px, -1px)' },
          '75%': { transform: 'translate(-1px, -1px)' },
        },
        neonFlicker: {
          '0%, 100%': { opacity: '1', textShadow: '0 0 3px currentColor, 0 0 6px currentColor' },
          '25%': { opacity: '0.9', textShadow: '0 0 2px currentColor' },
          '50%': { opacity: '0.95', textShadow: '0 0 4px currentColor' },
        },
        neonFlickerLite: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.9' },
        },
        dataStream: {
          '0%': { transform: 'translateY(100vh)', opacity: '0' },
          '5%': { opacity: '0.6' },
          '95%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-50px)', opacity: '0' },
        },
        matrixRain: {
          '0%': { transform: 'translateY(-50vh)', opacity: '0.8' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        hologram: {
          '0%, 100%': { transform: 'skew(0deg, 0deg)' },
          '50%': { transform: 'skew(0.3deg, 0.3deg)' },
        },
        circuitPulse: {
          '0%, 100%': { borderColor: 'rgba(0, 255, 255, 0.3)' },
          '50%': { borderColor: 'rgba(255, 0, 64, 0.4)' },
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
