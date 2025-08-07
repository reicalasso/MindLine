export interface ThemeColors {
  // Ana renkler
  primary: string;
  secondary: string;
  accent: string;
  
  // Arka plan renkleri
  background: string;
  surface: string;
  surfaceVariant: string;
  
  // Metin renkleri
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // UI renkleri
  border: string;
  borderLight: string;
  shadow: string;
  
  // Durumsal renkler
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Gradient'ler
  primaryGradient: string;
  backgroundGradient: string;
  accentGradient: string;
}

export interface ThemeTypography {
  // Font ailesi
  fontFamily: string;
  fontFamilyHeading: string;
  fontFamilyMono: string;
  
  // Font boyutları
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  
  // Font kalınlıkları
  fontWeight: {
    light: string;
    normal: string;
    medium: string;
    bold: string;
    black: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface ThemeAnimations {
  // Süre ayarları
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  
  // Easing fonksiyonları
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  
  // Özel animasyonlar
  custom?: {
    [key: string]: string;
  };
}

export interface ThemeBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface Theme {
  // Temel bilgiler
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'cute' | 'romantic' | 'dark' | 'minimal' | 'colorful' | 'professional';
  
  // Stil sistemi
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  animations: ThemeAnimations;
  breakpoints: ThemeBreakpoints;
  
  // CSS sınıfları
  styles: {
    // Temel bileşen sınıfları
    card: string;
    button: string;
    input: string;
    modal: string;
    
    // Layout sınıfları
    container: string;
    background: string;
    
    // Metin sınıfları
    heading: string;
    text: string;
    textMuted: string;
    
    // Dekoratif sınıflar
    decoration: string[];
    effects: string[];
  };
  
  // Özel CSS değişkenleri
  cssVariables?: Record<string, string>;
}

export type ThemeMode = 'cat' | 'romantic' | 'cyberpunk' | 'minimal' | 'nature' | 'ocean';

// Temel tema şablonu
const createBaseTheme = (overrides: Partial<Theme>): Theme => {
  const base: Theme = {
    id: 'base',
    name: 'Base Theme',
    emoji: '⚪',
    description: 'Base theme template',
    category: 'minimal',
    
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceVariant: '#f1f5f9',
      text: '#1e293b',
      textSecondary: '#64748b',
      textMuted: '#94a3b8',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      shadow: 'rgba(0, 0, 0, 0.1)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      primaryGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      backgroundGradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      accentGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontFamilyHeading: 'Inter, system-ui, -apple-system, sans-serif',
      fontFamilyMono: 'JetBrains Mono, Consolas, Monaco, monospace',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        bold: '700',
        black: '900',
      },
    },
    
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
      '2xl': '4rem',
      '3xl': '6rem',
      '4xl': '8rem',
    },
    
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    
    breakpoints: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    
    styles: {
      card: 'bg-white rounded-lg shadow-md border border-gray-200',
      button: 'px-4 py-2 rounded-lg font-medium transition-colors',
      input: 'px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent',
      modal: 'bg-white rounded-xl shadow-2xl',
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      background: 'bg-gray-50',
      heading: 'font-semibold text-gray-900',
      text: 'text-gray-700',
      textMuted: 'text-gray-500',
      decoration: [],
      effects: ['transition-all', 'duration-300'],
    },
  };
  
  return { ...base, ...overrides };
};

export const themes: Record<ThemeMode, Theme> = {
  cat: createBaseTheme({
    id: 'cat',
    name: 'Kedili Tema',
    emoji: '😺',
    description: 'Sevimli kedi teması - yumuşak renkler ve eğlenceli animasyonlar',
    category: 'cute',
    
    colors: {
      primary: '#f21c1c',
      secondary: '#f8b668',
      accent: '#fbd2a2',
      background: '#ffffff',
      surface: '#fef7ee',
      surfaceVariant: '#fde8d1',
      text: '#374151',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      border: '#f8b668',
      borderLight: '#fbd2a2',
      shadow: 'rgba(242, 113, 28, 0.2)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      primaryGradient: 'linear-gradient(135deg, #f21c1c 0%, #f8b668 100%)',
      backgroundGradient: 'linear-gradient(135deg, #fef7ee 0%, #fde8d1 30%, #fbd2a2 70%, #f8b668 100%)',
      accentGradient: 'linear-gradient(135deg, #fbd2a2 0%, #f8b668 100%)',
    },
    
    typography: {
      fontFamily: 'Indie Flower, Comic Sans MS, cursive',
      fontFamilyHeading: 'Caveat, Dancing Script, cursive',
      fontFamilyMono: 'JetBrains Mono, Consolas, Monaco, monospace',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        bold: '700',
        black: '900',
      },
    },
    
    animations: {
      duration: {
        fast: '200ms',
        normal: '400ms',
        slow: '600ms',
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      custom: {
        bounce: 'bounce-cat 2s infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
        purr: 'purr 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
    
    styles: {
      card: 'bg-white/90 backdrop-blur-sm rounded-xl shadow-cat border border-cat-200',
      button: 'bg-cat-gradient text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all',
      input: 'px-4 py-2 border border-cat-300 rounded-lg focus:ring-2 focus:ring-cat-500 focus:border-transparent bg-white/50',
      modal: 'bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-cat-200',
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      background: 'bg-cat-gradient min-h-screen',
      heading: 'font-romantic text-cat-700',
      text: 'text-cat-600',
      textMuted: 'text-cat-400',
      decoration: ['cat-decoration-1', 'cat-decoration-2', 'cat-decoration-3'],
      effects: ['transition-all', 'duration-300', 'hover:animate-wiggle'],
    },
    
    cssVariables: {
      '--cat-purr-duration': '2s',
      '--cat-bounce-height': '20px',
    },
  }),

  romantic: createBaseTheme({
    id: 'romantic',
    name: 'Romantik Tema',
    emoji: '💕',
    description: 'Aşk dolu romantik renkler ve yumuşak geçişler',
    category: 'romantic',
    
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      accent: '#f9a8d4',
      background: '#ffffff',
      surface: '#fef2f8',
      surfaceVariant: '#fce7f3',
      text: '#374151',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      border: '#f472b6',
      borderLight: '#f9a8d4',
      shadow: 'rgba(236, 72, 153, 0.2)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      primaryGradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
      backgroundGradient: 'linear-gradient(135deg, #fef2f8 0%, #fce7f3 30%, #fbcfe8 70%, #f9a8d4 100%)',
      accentGradient: 'linear-gradient(135deg, #f9a8d4 0%, #f472b6 100%)',
    },
    
    typography: {
      fontFamily: 'Dancing Script, cursive',
      fontFamilyHeading: 'Caveat, Dancing Script, cursive',
      fontFamilyMono: 'JetBrains Mono, Consolas, Monaco, monospace',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        bold: '700',
        black: '900',
      },
    },
    
    animations: {
      duration: {
        fast: '200ms',
        normal: '400ms',
        slow: '600ms',
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      custom: {
        heartbeat: 'heartbeat 1.5s ease-in-out infinite',
        'bounce-love': 'bounce-love 1.5s ease-in-out infinite',
        sparkle: 'sparkle 2s ease-in-out infinite',
      },
    },
    
    styles: {
      card: 'bg-white/90 backdrop-blur-sm rounded-xl shadow-paw border border-pink-200',
      button: 'bg-love-gradient text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all',
      input: 'px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50',
      modal: 'bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-pink-200',
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      background: 'bg-love-gradient min-h-screen',
      heading: 'font-romantic text-pink-700',
      text: 'text-pink-600',
      textMuted: 'text-pink-400',
      decoration: ['romantic-decoration-1', 'romantic-decoration-2'],
      effects: ['transition-all', 'duration-300', 'hover:animate-heartbeat'],
    },
  }),

  cyberpunk: createBaseTheme({
    id: 'cyberpunk',
    name: 'Cyberpunk',
    emoji: '🤖',
    description: 'Gelecekçi neon renkler ve teknolojik hisler',
    category: 'dark',
    
    colors: {
      primary: '#00ffff',
      secondary: '#ff0080',
      accent: '#ffff00',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      surfaceVariant: '#2a2a2a',
      text: '#ffffff',
      textSecondary: '#cccccc',
      textMuted: '#888888',
      border: '#00ffff',
      borderLight: '#333333',
      shadow: 'rgba(0, 255, 255, 0.3)',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0040',
      info: '#00ffff',
      primaryGradient: 'linear-gradient(135deg, #00ffff 0%, #0080ff 100%)',
      backgroundGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)',
      accentGradient: 'linear-gradient(135deg, #ffff00 0%, #ff0080 100%)',
    },
    
    animations: {
      duration: {
        fast: '100ms',
        normal: '200ms',
        slow: '400ms',
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      custom: {
        glitch: 'glitch 2s infinite',
        neonFlicker: 'neonFlicker 3s infinite',
        dataStream: 'dataStream 5s linear infinite',
      },
    },
    
    styles: {
      card: 'bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-cyan-500/20 border border-cyan-500/30',
      button: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-4 py-2 rounded-lg font-medium hover:shadow-cyan-500/50 transition-all',
      input: 'px-4 py-2 border border-cyan-500/50 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-gray-900/50 text-white',
      modal: 'bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-cyan-500/30',
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      background: 'bg-gray-900 min-h-screen',
      heading: 'font-mono text-cyan-400',
      text: 'text-gray-300',
      textMuted: 'text-gray-500',
      decoration: ['cyber-grid', 'neon-glow'],
      effects: ['transition-all', 'duration-200', 'hover:animate-pulse'],
    },
  }),

  minimal: createBaseTheme({
    id: 'minimal',
    name: 'Minimal',
    emoji: '⚪',
    description: 'Sade ve temiz tasarım',
    category: 'minimal',
    
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#999999',
      background: '#ffffff',
      surface: '#f8f9fa',
      surfaceVariant: '#e9ecef',
      text: '#212529',
      textSecondary: '#6c757d',
      textMuted: '#adb5bd',
      border: '#dee2e6',
      borderLight: '#f8f9fa',
      shadow: 'rgba(0, 0, 0, 0.1)',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',
      primaryGradient: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
      backgroundGradient: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      accentGradient: 'linear-gradient(135deg, #999999 0%, #666666 100%)',
    },
    
    styles: {
      card: 'bg-white rounded-lg shadow-sm border border-gray-200',
      button: 'bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors',
      input: 'px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black',
      modal: 'bg-white rounded-lg shadow-xl',
      container: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
      background: 'bg-white min-h-screen',
      heading: 'font-semibold text-gray-900',
      text: 'text-gray-700',
      textMuted: 'text-gray-500',
      decoration: [],
      effects: ['transition-colors', 'duration-200'],
    },
  }),

  nature: createBaseTheme({
    id: 'nature',
    name: 'Doğa',
    emoji: '🌿',
    description: 'Doğal yeşil tonlar ve organik hisler',
    category: 'colorful',
    
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#6ee7b7',
      background: '#ffffff',
      surface: '#f0fdf4',
      surfaceVariant: '#dcfce7',
      text: '#374151',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      border: '#34d399',
      borderLight: '#6ee7b7',
      shadow: 'rgba(16, 185, 129, 0.2)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      primaryGradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      backgroundGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #bbf7d0 70%, #6ee7b7 100%)',
      accentGradient: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)',
    },
    
    styles: {
      card: 'bg-white/90 backdrop-blur-sm rounded-xl shadow-green-500/20 border border-green-200',
      button: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-green-500/30 transition-all',
      input: 'px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white/50',
      modal: 'bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-green-200',
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      background: 'bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen',
      heading: 'font-semibold text-green-800',
      text: 'text-green-700',
      textMuted: 'text-green-500',
      decoration: ['nature-leaf', 'organic-flow'],
      effects: ['transition-all', 'duration-300'],
    },
  }),

  ocean: createBaseTheme({
    id: 'ocean',
    name: 'Okyanus',
    emoji: '🌊',
    description: 'Sakin mavi tonlar ve dalga hissi',
    category: 'colorful',
    
    colors: {
      primary: '#0ea5e9',
      secondary: '#38bdf8',
      accent: '#7dd3fc',
      background: '#ffffff',
      surface: '#f0f9ff',
      surfaceVariant: '#e0f2fe',
      text: '#374151',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      border: '#38bdf8',
      borderLight: '#7dd3fc',
      shadow: 'rgba(14, 165, 233, 0.2)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
      primaryGradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
      backgroundGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 30%, #bae6fd 70%, #7dd3fc 100%)',
      accentGradient: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)',
    },
    
    styles: {
      card: 'bg-white/90 backdrop-blur-sm rounded-xl shadow-blue-500/20 border border-blue-200',
      button: 'bg-gradient-to-r from-blue-500 to-sky-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-blue-500/30 transition-all',
      input: 'px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white/50',
      modal: 'bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-blue-200',
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      background: 'bg-gradient-to-br from-blue-50 to-sky-50 min-h-screen',
      heading: 'font-semibold text-blue-800',
      text: 'text-blue-700',
      textMuted: 'text-blue-500',
      decoration: ['ocean-wave', 'water-ripple'],
      effects: ['transition-all', 'duration-300'],
    },
  }),
};
