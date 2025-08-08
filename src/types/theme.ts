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
    button: {
      base: string;
      primary: string;
      secondary: string;
    };
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

export type ThemeMode = 'cat' | 'minimal' | 'ocean' | 'skull-bunny';

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
      button: {
        base: 'px-4 py-2 rounded-lg font-medium transition-colors',
        primary: 'bg-blue-600 text-white',
        secondary: 'bg-gray-600 text-white',
      },
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
  minimal: createBaseTheme({
    id: 'minimal',
    name: 'Sade Tema',
    emoji: '🤍',
    description: 'Temiz ve sade tasarım - beyaz arkaplan ve mavi vurgular',
    category: 'minimal',

    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#1e40af',
      background: '#ffffff',
      surface: '#ffffff',
      surfaceVariant: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      textMuted: '#94a3b8',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      shadow: 'rgba(0, 0, 0, 0.05)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      primaryGradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      backgroundGradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      accentGradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
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
        bold: '600',
        black: '700',
      },
    },

    animations: {
      duration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },

    styles: {
      card: 'bg-white rounded-lg border border-gray-200 shadow-sm',
      button: {
        base: 'px-4 py-2 rounded-lg font-medium transition-colors',
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
      },
      input: 'px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white',
      modal: 'bg-white rounded-xl shadow-lg border border-gray-200',
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      background: 'bg-white min-h-screen',
      heading: 'font-semibold text-gray-900',
      text: 'text-gray-700',
      textMuted: 'text-gray-500',
      decoration: [],
      effects: ['transition-colors', 'duration-200'],
    },
  }),

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
      button: {
        base: 'px-4 py-2 rounded-lg font-medium transition-all',
        primary: 'bg-cat-gradient text-white hover:shadow-lg transform hover:scale-105',
        secondary: 'bg-white/80 text-cat-700 border border-cat-200 hover:bg-cat-50',
      },
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
  }),

  ocean: createBaseTheme({
    id: 'ocean',
    name: 'Okyanus Teması',
    emoji: '🌊',
    description: 'Denizin derinliklerini yansıtan sakin mavi tonları',
    category: 'colorful',

    colors: {
      primary: '#0ea5e9',
      secondary: '#14b8a6',
      accent: '#0284c7',
      background: '#f0f9ff',
      surface: '#ffffff',
      surfaceVariant: '#e0f2fe',
      text: '#0c4a6e',
      textSecondary: '#075985',
      textMuted: '#0369a1',
      border: '#bae6fd',
      borderLight: '#e0f2fe',
      shadow: 'rgba(14, 165, 233, 0.15)',
      success: '#14b8a6',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
      primaryGradient: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
      backgroundGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 30%, #bae6fd 70%, #7dd3fc 100%)',
      accentGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    },

    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontFamilyHeading: 'Montserrat, sans-serif',
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
        bold: '600',
        black: '700',
      },
    },

    animations: {
      duration: {
        fast: '200ms',
        normal: '350ms',
        slow: '500ms',
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      custom: {
        wave: 'wave 3s ease-in-out infinite',
        ripple: 'ripple 2s ease-out infinite',
        flow: 'flow 4s ease-in-out infinite',
        tide: 'tide 6s ease-in-out infinite',
      },
    },

    styles: {
      card: 'bg-white/90 backdrop-blur-sm rounded-2xl shadow-ocean border border-ocean-200',
      button: {
        base: 'px-4 py-2 rounded-lg font-medium transition-all',
        primary: 'bg-ocean-gradient text-white hover:shadow-wave transform hover:scale-105',
        secondary: 'bg-white/80 text-ocean-700 border border-ocean-200 hover:bg-ocean-50',
      },
      input: 'px-4 py-2 border border-ocean-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent bg-white/70',
      modal: 'bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-ocean-200',
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      background: 'bg-ocean-gradient min-h-screen',
      heading: 'font-elegant text-ocean-700',
      text: 'text-ocean-600',
      textMuted: 'text-ocean-400',
      decoration: ['ocean-decoration-1', 'ocean-decoration-2', 'ocean-decoration-3'],
      effects: ['transition-all', 'duration-350', 'hover:animate-wave'],
    },

    cssVariables: {
      '--ocean-wave-duration': '3s',
      '--ocean-depth': '100px',
      '--ocean-transparency': '0.85',
    },
  }),

  'skull-bunny': createBaseTheme({
    id: 'skull-bunny',
    name: 'Skull Bunny',
    emoji: '🐰💀',
    description: 'Dark gothic anime teması - chibi tavşan çifti ve gotik atmosfer',
    category: 'dark',

    colors: {
      primary: '#A6282E',
      secondary: '#5A0F14',
      accent: '#3AC1B0',
      background: 'linear-gradient(180deg, rgba(11, 11, 13, 0.85) 0%, rgba(30, 30, 34, 0.85) 100%), url(\'/images/skull-bunny-bg.jpg\') center/cover no-repeat fixed',
      surface: '#1E1E22',
      surfaceVariant: '#2A2A2E',
      text: '#D9CBA3',
      textSecondary: '#A8A8A8',
      textMuted: '#6B6B6F',
      border: '#5A0F14',
      borderLight: '#A6282E',
      shadow: 'rgba(166, 40, 46, 0.3)',
      success: '#3AC1B0',
      warning: '#D9CBA3',
      error: '#A6282E',
      info: '#3AC1B0',
      primaryGradient: 'linear-gradient(135deg, #A6282E 0%, #5A0F14 100%)',
      backgroundGradient: 'linear-gradient(180deg, rgba(11, 11, 13, 0.85) 0%, rgba(30, 30, 34, 0.85) 100%), url(\'/images/skull-bunny-bg.jpg\') center/cover no-repeat fixed',
      accentGradient: 'linear-gradient(135deg, #3AC1B0 0%, #A6282E 100%)',
    },

    typography: {
      fontFamily: 'Inter, Roboto, sans-serif',
      fontFamilyHeading: 'UnifrakturCook, Cinzel Decorative, serif',
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
        bold: '600',
        black: '700',
      },
    },

    animations: {
      duration: {
        fast: '200ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      custom: {
        flicker: 'flicker 3s linear infinite',
        glowRed: 'glow-red 1.5s ease-in-out infinite alternate',
        fadeIn: 'fadeIn 0.5s ease-out',
        ghostFloat: 'float 4s ease-in-out infinite',
      },
    },

    styles: {
      card: 'bg-skull-bunny-iron/90 backdrop-blur-xl rounded-lg shadow-skull-bunny border border-skull-bunny-crimson-dark/30',
      button: {
        base: 'px-4 py-2 rounded-lg font-medium transition-all',
        primary: 'bg-skull-bunny-primary-gradient text-skull-bunny-parchment hover:shadow-skull-bunny-glow transform hover:scale-105',
        secondary: 'bg-skull-bunny-iron/80 text-skull-bunny-parchment border border-skull-bunny-crimson-dark/50 hover:bg-skull-bunny-crimson-dark/20',
      },
      input: 'px-4 py-2 border border-skull-bunny-crimson-dark/50 rounded-lg focus:ring-2 focus:ring-skull-bunny-crimson-light/30 bg-skull-bunny-iron/80 text-skull-bunny-parchment',
      modal: 'bg-skull-bunny-iron/95 backdrop-blur-lg rounded-xl shadow-2xl border border-skull-bunny-crimson-dark/50',
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      background: 'bg-skull-bunny-bg-gradient min-h-screen relative',
      heading: 'font-skull-bunny-heading text-skull-bunny-parchment',
      text: 'text-skull-bunny-parchment',
      textMuted: 'text-skull-bunny-silver',
      decoration: ['skull-bunny-decoration-1', 'skull-bunny-decoration-2'],
      effects: ['transition-all', 'duration-300', 'hover:animate-flicker'],
    },

    cssVariables: {
      '--skull-bunny-glow-intensity': '0.5',
      '--skull-bunny-flicker-speed': '3s',
      '--skull-bunny-crimson-glow': 'rgba(166, 40, 46, 0.4)',
      '--skull-bunny-bg-blur': '2px',
      '--skull-bunny-overlay-opacity': '0.85',
    },
  }),
};
  