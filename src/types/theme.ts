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

export type ThemeMode = 'cat';

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
};
